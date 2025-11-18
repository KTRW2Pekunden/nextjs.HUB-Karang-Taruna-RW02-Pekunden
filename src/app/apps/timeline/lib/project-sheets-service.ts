"use server";
import { google } from "googleapis";
import { Project, Milestone } from "../types";

const PROJECT_SHEET_NAME = "PROJECTS";
const MILESTONE_SHEET_NAME = "MILESTONES";

const SPREADSHEET_ID = process.env.SHEET_ID_TIMELINE!;

function getAuth() {
  return google.auth.getClient({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function findRowNumberById(
  sheetName: string,
  id: string
): Promise<number> {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
  });

  const rows = response.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      return i + 1; 
    }
  }
  return -1;
}

let MILESTONE_SHEET_ID: number | null = null;
let PROJECT_SHEET_ID: number | null = null;

async function getSheetId(sheetName: string): Promise<number> {
  if (sheetName === MILESTONE_SHEET_NAME && MILESTONE_SHEET_ID !== null)
    return MILESTONE_SHEET_ID;
  if (sheetName === PROJECT_SHEET_NAME && PROJECT_SHEET_ID !== null)
    return PROJECT_SHEET_ID;

  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties",
  });

  const sheet = response.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    console.warn(
      `Sheet ID untuk '${sheetName}' tidak ditemukan. Menggunakan default ID: 0.`
    );
    if (sheetName === MILESTONE_SHEET_NAME) MILESTONE_SHEET_ID = 0;
    if (sheetName === PROJECT_SHEET_NAME) PROJECT_SHEET_ID = 0;
    return 0;
  } else {
    if (sheetName === MILESTONE_SHEET_NAME) MILESTONE_SHEET_ID = sheetId;
    if (sheetName === PROJECT_SHEET_NAME) PROJECT_SHEET_ID = sheetId;
    return sheetId;
  }
}

async function sortMilestonesByDate() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const sheetId = await getSheetId(MILESTONE_SHEET_NAME);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MILESTONE_SHEET_NAME}!A:A`,
  });
  const lastRowIndex = response.data.values?.length || 1;

  if (lastRowIndex <= 1) return; 

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          sortRange: {
            range: {
              sheetId: sheetId,
              startRowIndex: 1,
              endRowIndex: lastRowIndex,
              startColumnIndex: 0,
              endColumnIndex: 7, 
            },
            sortSpecs: [
              {
                dimensionIndex: 3, 
                sortOrder: "ASCENDING",
              },
            ],
          },
        },
      ],
    },
  });
}

async function deleteMilestonesByProjectId(
  projectId: string
): Promise<{ success: true }> {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const milestoneSheetId = await getSheetId(MILESTONE_SHEET_NAME);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MILESTONE_SHEET_NAME}!B:B`,
  });

  const rows = response.data.values || [];
  const rowsToDelete: number[] = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === projectId) {
      rowsToDelete.push(i + 1);
    }
  }

  if (rowsToDelete.length === 0) {
    return { success: true };
  }

  const requests = rowsToDelete.map((rowNumber, index) => ({
    deleteDimension: {
      range: {
        sheetId: milestoneSheetId,
        dimension: "ROWS",
        startIndex: rowNumber - 1 - index,
        endIndex: rowNumber - index,
      },
    },
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests },
  });
  await sortMilestonesByDate();
  return { success: true };
}

export async function getProjectsFromSheet(): Promise<Project[]> {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const projResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${PROJECT_SHEET_NAME}!A:D`,
  });

  const projRows = projResponse.data.values || [];
  if (projRows.length <= 1) return [];

  const projHeader = projRows[0];
  const projectsData: Project[] = projRows.slice(1).map((row) => {
    const obj: Partial<Project> = {};
    projHeader.forEach((col, i) => {
      if (col === "PROJECT_ID") obj.id = row[i];
      if (col === "NAME") obj.name = row[i];
      if (col === "DESCRIPTION") obj.description = row[i];
    });
    return { ...obj, timeline: [] } as Project;
  });

  const mileResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MILESTONE_SHEET_NAME}!A:G`,
  });

  const mileRows = mileResponse.data.values || [];
  const mileHeader = mileRows[0];

  if (mileRows.length > 1) {
    mileRows.slice(1).forEach((row) => {
      const milestone: Partial<Milestone> & { projectId?: string } = {};

      mileHeader.forEach((col, i) => {
        if (col === "MILESTONE_ID") milestone.id = row[i];
        if (col === "PROJECT_ID") milestone.projectId = row[i];
        if (col === "TITLE") milestone.title = row[i];
        if (col === "START_DATE") milestone.start = row[i];
        if (col === "END_DATE") milestone.end = row[i];
        if (col === "STATUS") milestone.status = row[i] as Milestone["status"];
        if (col === "DATE_LABEL") milestone.dateLabel = row[i];
      });

      const parentProject = projectsData.find(
        (p) => p.id === milestone.projectId
      );
      if (parentProject) {
        parentProject.timeline.push(milestone as Milestone);
      }
    });
  }

  return projectsData;
}

export async function addProjectToSheet(
  project: Pick<Project, "id" | "name" | "description">
) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    [
      project.id,
      project.name,
      project.description,
      "Active",
      new Date().toISOString().split("T")[0],
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${PROJECT_SHEET_NAME}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return { success: true };
}

export async function updateProjectInSheet(
  project: Pick<Project, "id" | "name" | "description">
) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const rowNumber = await findRowNumberById(PROJECT_SHEET_NAME, project.id);

  if (rowNumber === -1) {
    throw new Error("Project ID tidak ditemukan.");
  }

  const values = [[project.name, project.description]];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${PROJECT_SHEET_NAME}!B${rowNumber}:C${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  return { success: true };
}

export async function deleteProjectFromSheet(projectId: string) {
  await deleteMilestonesByProjectId(projectId);

  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const projectSheetId = await getSheetId(PROJECT_SHEET_NAME);

  const projectRowNumber = await findRowNumberById(
    PROJECT_SHEET_NAME,
    projectId
  );

  if (projectRowNumber === -1) {
    throw new Error("Project ID tidak ditemukan.");
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: projectSheetId,
              dimension: "ROWS",
              startIndex: projectRowNumber - 1,
              endIndex: projectRowNumber,
            },
          },
        },
      ],
    },
  });

  return { success: true };
}

async function addMilestone(projectId: string, m: Milestone) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    [m.id, projectId, m.title, m.start, m.end, m.status, m.dateLabel],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MILESTONE_SHEET_NAME}!A:G`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  await sortMilestonesByDate();
  return { success: true };
}

async function updateMilestone(projectId: string, m: Milestone) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const rowNumber = await findRowNumberById(MILESTONE_SHEET_NAME, m.id);

  if (rowNumber === -1) {
    throw new Error("Milestone ID tidak ditemukan.");
  }

  const values = [
    [m.id, projectId, m.title, m.start, m.end, m.status, m.dateLabel],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${MILESTONE_SHEET_NAME}!A${rowNumber}:G${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  await sortMilestonesByDate();
  return { success: true };
}

export async function saveMilestoneToSheet(
  milestone: Milestone,
  projectId: string,
  isEditing: boolean
) {
  if (isEditing) {
    return updateMilestone(projectId, milestone);
  } else {
    return addMilestone(projectId, milestone);
  }
}

export async function updateMilestoneStatus(
  milestoneId: string,
  newStatus: Milestone["status"]
) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const rowNumber = await findRowNumberById(MILESTONE_SHEET_NAME, milestoneId);

  if (rowNumber === -1) {
    throw new Error("Milestone ID tidak ditemukan.");
  }

  const range = `${MILESTONE_SHEET_NAME}!F${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[newStatus]] },
  });

  return { success: true };
}

export async function deleteMilestone(milestoneId: string) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const rowNumber = await findRowNumberById(MILESTONE_SHEET_NAME, milestoneId);

  if (rowNumber === -1) {
    throw new Error("Milestone ID tidak ditemukan.");
  }

  const sheetId = await getSheetId(MILESTONE_SHEET_NAME);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });

  await sortMilestonesByDate();
  return { success: true };
}
