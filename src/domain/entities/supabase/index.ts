// Importamos los tipos (para usarlos en la interfaz Database de abajo) y los
// re-exportamos. Un `export type { ... } from` solo re-exporta: no deja los
// nombres en el scope local, por eso la interfaz Database no los encontraba.
import type {
  UsersRow, UsersInsert, UsersUpdate,
  UserRolesRow, UserRolesInsert, UserRolesUpdate,
  PushSubscriptionsRow, PushSubscriptionsInsert, PushSubscriptionsUpdate,
} from './users';
import type {
  CategoriesRow, CategoriesInsert, CategoriesUpdate,
} from './categories';
import type {
  SocialGroupsRow, SocialGroupsInsert, SocialGroupsUpdate,
} from './social_groups';
import type {
  PlacesRow, PlacesInsert, PlacesUpdate,
  PlaceSocialGroupsRow, PlaceSocialGroupsInsert, PlaceSocialGroupsUpdate,
  SavedPlacesRow, SavedPlacesInsert, SavedPlacesUpdate,
  PlaceSurveysRow, PlaceSurveysInsert, PlaceSurveysUpdate,
} from './places';
import type {
  ReviewsRow, ReviewsInsert, ReviewsUpdate,
} from './reviews';
import type {
  EventsRow, EventsInsert, EventsUpdate,
  EventAttendanceRow, EventAttendanceInsert, EventAttendanceUpdate,
  EventSharesRow, EventSharesInsert, EventSharesUpdate,
} from './events';
import type {
  NotificationsRow, NotificationsInsert, NotificationsUpdate,
} from './notifications';

export type {
  UsersRow, UsersInsert, UsersUpdate,
  UserRolesRow, UserRolesInsert, UserRolesUpdate,
  PushSubscriptionsRow, PushSubscriptionsInsert, PushSubscriptionsUpdate,
} from './users';
export type {
  CategoriesRow, CategoriesInsert, CategoriesUpdate,
} from './categories';
export type {
  SocialGroupsRow, SocialGroupsInsert, SocialGroupsUpdate,
} from './social_groups';
export type {
  PlacesRow, PlacesInsert, PlacesUpdate,
  PlaceSocialGroupsRow, PlaceSocialGroupsInsert, PlaceSocialGroupsUpdate,
  SavedPlacesRow, SavedPlacesInsert, SavedPlacesUpdate,
  PlaceSurveysRow, PlaceSurveysInsert, PlaceSurveysUpdate,
} from './places';
export type {
  ReviewsRow, ReviewsInsert, ReviewsUpdate,
} from './reviews';
export type {
  EventsRow, EventsInsert, EventsUpdate,
  EventAttendanceRow, EventAttendanceInsert, EventAttendanceUpdate,
  EventSharesRow, EventSharesInsert, EventSharesUpdate,
} from './events';
export type {
  NotificationsRow, NotificationsInsert, NotificationsUpdate,
} from './notifications';

export interface Database {
  public: {
    Tables: {
      users: { Row: UsersRow; Insert: UsersInsert; Update: UsersUpdate };
      categories: { Row: CategoriesRow; Insert: CategoriesInsert; Update: CategoriesUpdate };
      social_groups: { Row: SocialGroupsRow; Insert: SocialGroupsInsert; Update: SocialGroupsUpdate };
      places: { Row: PlacesRow; Insert: PlacesInsert; Update: PlacesUpdate };
      place_social_groups: { Row: PlaceSocialGroupsRow; Insert: PlaceSocialGroupsInsert; Update: PlaceSocialGroupsUpdate };
      reviews: { Row: ReviewsRow; Insert: ReviewsInsert; Update: ReviewsUpdate };
      saved_places: { Row: SavedPlacesRow; Insert: SavedPlacesInsert; Update: SavedPlacesUpdate };
      events: { Row: EventsRow; Insert: EventsInsert; Update: EventsUpdate };
      event_attendance: { Row: EventAttendanceRow; Insert: EventAttendanceInsert; Update: EventAttendanceUpdate };
      event_shares: { Row: EventSharesRow; Insert: EventSharesInsert; Update: EventSharesUpdate };
      place_surveys: { Row: PlaceSurveysRow; Insert: PlaceSurveysInsert; Update: PlaceSurveysUpdate };
      notifications: { Row: NotificationsRow; Insert: NotificationsInsert; Update: NotificationsUpdate };
      user_roles: { Row: UserRolesRow; Insert: UserRolesInsert; Update: UserRolesUpdate };
      push_subscriptions: { Row: PushSubscriptionsRow; Insert: PushSubscriptionsInsert; Update: PushSubscriptionsUpdate };
    };
  };
}
