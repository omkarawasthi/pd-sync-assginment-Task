export interface PipedriveOwner {
  id: number;
  name: string;
  email: string;
  has_pic: number;
  pic_hash: string | null;
  active_flag: boolean;
  value: number;
}

export interface PipedriveContactInfo {
  label?: string; // Made optional to match usage in objectUtils.ts
  value: string;
  primary: boolean;
}

export interface PipedrivePersonOrganization {
  name: string;
  people_count: number;
  owner_id: number;
  address: string;
  label_ids: string[];
  active_flag: boolean;
  cc_email: string;
  owner_name: string;
  value: number;
}

export interface PipedrivePerson {
  id: number;
  owner_id: PipedriveOwner;
  org_id: PipedrivePersonOrganization;
  name: string;
  first_name: string;
  last_name: string;
  open_deals_count: number;
  related_open_deals_count: number;
  closed_deals_count: number;
  related_closed_deals_count: number;
  participant_open_deals_count: number;
  participant_closed_deals_count: number;
  email_messages_count: number;
  activities_count: number;
  done_activities_count: number;
  undone_activities_count: number;
  files_count: number;
  notes_count: number;
  followers_count: number;
  won_deals_count: number;
  related_won_deals_count: number;
  lost_deals_count: number;
  related_lost_deals_count: number;
  active_flag: boolean;
  first_char: string;
  update_time: string;
  add_time: string;
  visible_to: string;
  picture_id: string | null;
  next_activity_date: string | null;
  next_activity_time: string | null;
  next_activity_id: number | null;
  last_activity_id: number | null;
  last_activity_date: string | null;
  last_incoming_mail_time: string | null;
  last_outgoing_mail_time: string | null;
  label: string | null;
  label_ids: string[];
  im: PipedriveContactInfo[];
  postal_address: string | null;
  postal_address_lat: number | null;
  postal_address_long: number | null;
  postal_address_subpremise: string | null;
  postal_address_street_number: string | null;
  postal_address_route: string | null;
  postal_address_sublocality: string | null;
  postal_address_locality: string | null;
  postal_address_admin_area_level_1: string | null;
  postal_address_admin_area_level_2: string | null;
  postal_address_country: string | null;
  postal_address_postal_code: string | null;
  postal_address_formatted_address: string | null;
  notes: string | null;
  birthday: string | null;
  job_title: string | null;
  org_name: string;
  owner_name: string;
  primary_email: string;
  cc_email: string;
  company_id: number;
  // Allow additional string keys for custom fields (like the hash-named fields in the JSON)
  [key: string]: any;
}

// Simplified InputData interface - using Record<string, any> instead of complex nested interfaces
export interface InputData {
  [key: string]: any;
}

// Define type for mapping configuration
export interface FieldMapping {
  pipedriveKey: string;
  inputKey: string;
}

// Define types for Pipedrive person data structure
export interface PipedrivePersonData {
  name?: string;
  email?: PipedriveContactInfo[];
  phone?: PipedriveContactInfo[];
  [key: string]: any; // Allow additional string keys for custom fields
}

export interface PipedriveCreateUpdateResponse {
    success: boolean;
    data: PipedrivePerson;
}

export interface PipedriveSearchResponse {
    success: boolean;
    data: {
        items: Array<{
            item: PipedrivePerson;
        }>;
    };
}