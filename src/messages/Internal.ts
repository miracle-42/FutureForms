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
 * * TRX: 5020 Transactions
 * * SQL: 5030 Propagate messages from database
 * * ORDB: 5010 Propagate messages from OpenRestDB
 * * FORM: 5040 Form messages
 * * BLOCK: 5050 Block messages
 * * FIELD: 5060 Field messages
 * * FRAMEWORK: 5000 Internal framework messages
 * * VALIDATION: 5070 Validation
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
