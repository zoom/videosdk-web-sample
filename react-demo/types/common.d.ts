/**
 * Define error types of operations.
 * - INVALID_OPERATION: The operation is invalid, perhaps causeed by the duplicated operations.
 * - INTERNAL_ERROR: The remote service is temporarily unavailable.
 * - INSUFFICIENT_PRIVILEGES: The operation is only applicable for host or manager.
 * - OPERATION_TIMEOUT: The operation is timeout, try again later.
 * - IMPROPER_MEETING_STATE: The user is not in meeting, refer to the relevant reason for the detail.
 *  - `closed`: The meeting is not joined.
 *  - `on hold`: You are on hold.
 *  - `reconnecting`: The meeting is reconnecting.
 * - INVALID_PARAMETERS: The parameters passing to the method is invala, perhaps the wrong user id or the wrong value, refer to the relevant reason for the detail.
 * - OPERATION_LOCKED: The operation can not be completed because the relevant property is locked, refer to the relevant reason for the detail.
 */
export type ErrorTypes =
  | 'INVALID_OPERATION'
  | 'INTERNAL_ERROR'
  | 'OPERATION_TIMEOUT'
  | 'INSUFFICIENT_PRIVILEGES'
  | 'IMPROPER_MEETING_STATE'
  | 'INVALID_PARAMETERS'
  | 'OPRATION_LOCKED';
interface ExecutedFailure {
  type: ErrorTypes;
  reason: string;
}
/**
 * The result of asynchronous operation. It is a promise object.
 * - '': Success
 * - ExecutedFailure: Failure. Use `.catch(error=>{})` or `try{ *your code* }catch(error){}` to handle the errors.
 */
export type ExecutedResult = Promise<'' | ExecutedFailure>;
/**
 * Interface for the additional configuration of initialization.
 */
