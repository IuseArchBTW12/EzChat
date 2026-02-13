/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chatrooms from "../chatrooms.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as moderation from "../moderation.js";
import type * as users from "../users.js";
import type * as webrtc from "../webrtc.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chatrooms: typeof chatrooms;
  favorites: typeof favorites;
  http: typeof http;
  messages: typeof messages;
  moderation: typeof moderation;
  users: typeof users;
  webrtc: typeof webrtc;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
