export interface PlaceFakeReportsRow {
  id: string;
  place_id: string;
  reporter_id: string;
  created_at: string;
}

export interface PlaceFakeReportsInsert {
  id?: string;
  place_id: string;
  reporter_id: string;
}

export interface PlaceFakeReportsUpdate {
  id?: string;
}
