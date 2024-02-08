/**
 * Error message groups.
 *
 * An error messages comes in two parts.
 * A message group followed by a message item.
 *
 * @example
 * If there is an error '0017' from the database
 * the raised error code would be '5030-0017'.
 * 
 * List of message groups:
 * * 5000: FRAMEWORK - Internal framework messages
 * * 5010: ORDB - Propagate messages from OpenRestDB
 * * 5020: TRX - Transactions
 * * 5030: SQL - Propagate messages from database
 * * 5040: FORM - Form messages
 * * 5050: BLOCK - Block messages
 * * 5060: FIELD - Field messages
 * * 5070: VALIDATION - Validation
 */
export class MSGGRP
{
	public static TRX:number = 5020;
	public static SQL:number = 5030;
	public static ORDB:number = 5010;
	public static FORM:number = 5040;
	public static BLOCK:number = 5050;
	public static FIELD:number = 5060;
	public static FRAMEWORK:number = 5000;
	public static VALIDATION:number = 5070;
}
