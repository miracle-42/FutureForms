/*
  MIT License

  Copyright © 2023 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Block } from './Block.js';
import { Class, isClass } from './Class.js';
import { Alert } from '../application/Alert.js';
import { Key } from '../model/relations/Key.js';
import { ListOfValues } from './ListOfValues.js';
import { MSGGRP } from '../messages/Internal.js';
import { Form as ViewForm } from '../view/Form.js';
import { DateConstraint } from './DateConstraint.js';
import { KeyMap } from '../control/events/KeyMap.js';
import { TriggerFunction } from './TriggerFunction.js';
import { Framework } from '../application/Framework.js';
import { Messages, Level } from '../messages/Messages.js';
import { Properties } from '../application/Properties.js';
import { EventType } from '../control/events/EventType.js';
import { FormBacking } from '../application/FormBacking.js';
import { DataSource } from '../model/interfaces/DataSource.js';
import { EventFilter } from '../control/events/EventFilter.js';
import { Canvas, View } from '../application/interfaces/Canvas.js';
import { CanvasComponent } from '../application/CanvasComponent.js';
import { FormEvent, FormEvents } from '../control/events/FormEvents.js';
import { ComponentFactory } from '../application/interfaces/ComponentFactory.js';

/*
 * Any change to this, must be carried forward to interal/form.
 * These 2 classes must be identical to avoid the severe javascript brain damage:
 * ReferenceError: Cannot access 'Form' before initialization, when forms calling forms
 */

/**
 * The form object links html and business logic.
 *
 * A form consists of blocks that links to backend data.
 * The form can hold all necessary code, LOV's etc. But in general
 * generic code for blocks should be put at the block level to ensure reuse.
 *
 */

export class Form implements CanvasComponent
{
	public title:string = "";
	public moveable:boolean = false;
	public resizable:boolean = false;
	public initiated:Date = new Date();
	public parameters:Map<any,any> = new Map<any,any>();

	/**
   * Constructs a new Form instance.
   *
   * @param page - The HTML page or element associated with the form.
   */
	constructor(page?:string|HTMLElement)
	{
		page = Framework.prepare(page);
		FormBacking.setBacking(this).page = page;
	}

	/**
   * Gets the lowercase name of the form's constructor.
   *
   * @returns The name of the form.
   */
	public get name() : string
	{
		return(this.constructor.name.toLowerCase());
	}

	/** The canvas points to the html associated with the form
	*
   * @returns The canvas element.
   */
	public get canvas() : Canvas
	{
		return(FormBacking.getViewForm(this)?.canvas);
	}

	/** Get all blocks on the form
	*
   * @returns An array of Block instances.
   */
	public get blocks() : Block[]
	{
		return(Array.from(FormBacking.getBacking(this).blocks.values()))
	}

	/** Remove the form from it's parent element
	*
	*/
	public hide() : void
	{
		this.canvas.remove();
	}

	/** Attach the form to it's previous parent
	*
	*/
	public show() : void
	{
		this.canvas.restore();
		this.focus();
	}

	/** Remove the form from it's parent element (same as hide)
	*
	*/
	public dettach() : void
	{
		this.canvas.remove();
	}

	/** Attach the form to this element
	*
	* @param parent - The parent element to attach the form to.
   */
	public attach(parent:HTMLElement) : void
	{
		parent.appendChild(this.canvas.getView());
	}

	/** Clears the form. If force, no validation will take place and changes will be ignored
	*
	* @param force - If true, no validation will occur.
   * @returns A promise indicating whether the clearing was successful.
   */
	public async clear(force?:boolean) : Promise<boolean>
	{
		if (force) FormBacking.getModelForm(this)?.clear();
		return(FormBacking.getViewForm(this)?.clear(!force));
	}

	/** Focuses on the form.
   *
   */
	public focus() : void
	{
		FormBacking.getViewForm(this)?.focus();
	}

	/** Gets the current block.
   *
   * @returns The current block.
   */
	public getCurrentBlock() : Block
	{
		return(this.getBlock(FormBacking.getViewForm(this)?.block?.name));
	}

	/** Requires the block using the current filter. Often used with sorting
	*
	* @param block - The block to requery.
   * @returns A promise indicating whether the requery was successful.
   */
	public async reQuery(block:string) : Promise<boolean>
	{
		block = block?.toLowerCase();
		let blk:Block = this.getBlock(block);

		if (blk == null)
		{
			// Block does not exist
			Messages.severe(MSGGRP.FORM,1,block);
			return(false);
		}

		return(blk.reQuery());
	}

	/** Enter the Query By Example mode for the specified block (and children)
	*
	* @param block - The block for which to enter Query By Example mode.
   * @returns A promise indicating whether entering Query By Example mode was successful.
   */
	public async enterQueryMode(block:string) : Promise<boolean>
	{
		block = block?.toLowerCase();
		let blk:Block = this.getBlock(block);

		if (blk == null)
		{
			// Block does not exist
			Messages.severe(MSGGRP.FORM,1,block);
			return(false);
		}

		return(blk.enterQueryMode());
	}

	/** Execute query for the specified block (and children)
	*
	* @param block - The block for which to execute the query.
   * @returns A promise indicating whether the query execution was successful.
   */
	public async executeQuery(block:string) : Promise<boolean>
	{
		block = block?.toLowerCase();
		let blk:Block = this.getBlock(block);

		if (blk == null)
		{
			// Block does not exist
			Messages.severe(MSGGRP.FORM,1,block);
			return(false);
		}

		return(blk.executeQuery());
	}

	/** Show the datepicker popup
	*
	* @param block - The block associated with the datepicker.
   * @param field - The field associated with the datepicker.
   * @param row - The row number (optional).
   */
	public showDatePicker(block:string, field:string, row?:number) : void
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		FormBacking.getViewForm(this).showDatePicker(block,field,row);
	}

	/** Show the LOV associated with the block, field. Normally only 1 LOV can be active, force overrules this rule
	*
	* @param block - The block associated with the List of Values.
   * @param field - The field associated with the List of Values.
   * @param row - The row number (optional).
   */
	public showListOfValues(block:string, field:string, row?:number) : void
	{
		block = block?.toLowerCase();
		field = field?.toLowerCase();
		FormBacking.getViewForm(this).showListOfValues(block,field,row);
	}

	/** Simulate keystroke from a field. The field is located from the block, field an optionally css-class
	*
	* @param key - The keystroke to simulate.
   * @param block - The block containing the field (optional).
   * @param field - The field to simulate the keystroke on (optional).
   * @param clazz - The CSS class (optional).
   * @returns A promise indicating whether the keystroke simulation was successful.
   */
	public async sendkey(key:KeyMap, block?:string, field?:string, clazz?:string) : Promise<boolean>
	{
		return(FormBacking.getViewForm(this).sendkey(key,block,field,clazz));
	}

	/** Link 2 blocks (master detail) on specified keys. If not orphan, the child block will not be part of QBE
	*
	* @param master - The key for the master block.
   * @param detail - The key for the detail block.
   * @param orphanQueries - If true, orphan queries will be set (optional).
   */
	public link(master:Key, detail:Key, orphanQueries?:boolean) : void
	{
		if (orphanQueries == null) orphanQueries = true;
		FormBacking.getBacking(this).setLink(master,detail,orphanQueries);
	}

	/**  Navigates to the specified block.
   *
   * @param block - The block to navigate to.
   * @returns A promise indicating whether the navigation was successful.
   */
	public async goBlock(block:string) : Promise<boolean>
	{
		return(this.getBlock(block)?.focus());
	}

	/** Navigates to the specified field in the specified block.
   *
   * @param block - The block containing the field.
   * @param field - The field to navigate to.
   * @param clazz - The CSS class (optional).
   * @returns A promise indicating whether the navigation was successful.
   */
	public async goField(block:string, field:string, clazz?:string) : Promise<boolean>
	{
		return(this.getBlock(block)?.goField(field,clazz));
	}

	/** Handle fine message
	*
	* @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
	public fine(grpno:number,errno:number,...args:any) : void
	{
		Messages.fine(grpno,errno,args);
	}

	/** Handle info message
	*
	* @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
	public info(grpno:number,errno:number,...args:any) : void
	{
		Messages.info(grpno,errno,args);
	}

	/** Handle warning message
	*
	* @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
	public warn(grpno:number,errno:number,...args:any) : void
	{
		Messages.warn(grpno,errno,args);
	}

	/** Handle severe message
	*
	* @param grpno - The group number.
   * @param errno - The error number.
   * @param args - Additional arguments.
   */
	public severe(grpno:number,errno:number,...args:any) : void
	{
		Messages.severe(grpno,errno,args);
	}

	/** Popup a message
	*
	* @param msg - The message to display.
   * @param title - The title of the popup.
   * @param level - The level of the message (optional).
   */
	public alert(msg:string, title:string, level?:Level) : void
	{
		if (!level)
			level = Level.info;

		switch(level)
		{
			case Level.info: Alert.message(msg,title); break;
			case Level.warn: Alert.warning(msg,title); break;
			case Level.severe: Alert.fatal(msg,title); break;
		}
	}

	/** Has the form been validated, and is everthing consistent
	*
	* @returns True if the form is valid, otherwise false.
   */
	public get valid() : boolean
	{
		if (FormBacking.getModelForm(this).eventTransaction.running() > 0)
			return(false);

		return(FormBacking.getViewForm(this).validated());
	}

	/** Validates all user input
	*
	* @returns A promise indicating whether the validation was successful.
   */
	public async validate() : Promise<boolean>
	{
		return(FormBacking.getViewForm(this).validate());
	}

	/** Returns the canvas html-element
	*
	* @returns The HTML element representing the view.
   */
	public getView() : HTMLElement
	{
		let view:HTMLElement = this.canvas?.getView();

		if (view != null) return(view);
		else return(FormBacking.getBacking(this).page);
	}

	/** Returns the canvas view (x,y,h,w)
	*
	* @returns The canvas view as a View object.
   */
	public getViewPort() : View
	{
		return(this.canvas.getViewPort());
	}

	/** Sets the canvas view (x,y,h,w)
	*
	* @param view - The View object representing the new canvas view.
   */
	public setViewPort(view:View) : void
	{
		this.canvas.setViewPort(view);
	}

	/** Returns the canvas parent view (x,y,h,w)
	*
	* @returns The parent view as a View object.
   */
	public getParentViewPort() : View
	{
		return(this.canvas.getParentViewPort());
	}

	/**  Gets the block associated with the specified name.
   *
   * @param block - The name of the block.
   * @returns The Block object associated with the specified name.
   */
	public getBlock(block:string) : Block
	{
		return(FormBacking.getBacking(this).blocks.get(block?.toLowerCase()));
	}

	/** Set the datasource for the given block
	*
	* @param block - The block for which to set the data source.
   * @param source - The data source to set.
   */
	public setDataSource(block:string,source:DataSource) : void
	{
		FormBacking.getModelForm(this,true).setDataSource(block?.toLowerCase(),source);
	}

	/** Get the LOV for the given block and field
	*
	* @param block - The block associated with the LOV.
   * @param field - The field associated with the LOV.
   * @returns The List of Values (LOV) for the given block and field.
   */
	public getListOfValues(block:string, field:string) : ListOfValues
	{
		return(FormBacking.getBacking(this).getListOfValues(block,field));
	}

	/** Remove the LOV for the given block and field
	*
	* @param block - The block associated with the LOV.
   * @param field - The field associated with the LOV, or an array of fields.
   */
	public removeListOfValues(block:string, field:string|string[]) : void
	{
		if (!Array.isArray(field))
			field = [field];

		for (let i = 0; i < field.length; i++)
			FormBacking.getBacking(this).removeListOfValues(block,field[i]);
	}

	/** Set the LOV for the given block, field or fields
	*
	* @param lov - The List of Values (LOV) or its class.
   * @param block - The block associated with the LOV.
   * @param field - The field associated with the LOV, or an array of fields.
   */
	public setListOfValues(lov:ListOfValues|Class<ListOfValues>, block:string, field:string|string[]) : void
	{
		if (!Array.isArray(field))
			field = [field];

		if (isClass(lov))
		{
			let factory:ComponentFactory = Properties.FactoryImplementation;
			lov = factory.createBean(lov) as ListOfValues;
		}

		for (let i = 0; i < field.length; i++)
			FormBacking.getBacking(this).setListOfValues(block,field[i],lov);
	}

	/** Set the date constraint ie exclude weekends and holidays from the datepicker
	*
	* @param datecstr - The date constraint to set.
   * @param block - The block associated with the date constraint.
   * @param field - The field associated with the date constraint, or an array of fields.
   */
	public setDateConstraint(datecstr:DateConstraint, block:string, field:string|string[]) : void
	{
		if (!Array.isArray(field))
			field = [field];

		for (let i = 0; i < field.length; i++)
			FormBacking.getBacking(this).setDateConstraint(block,field[i],datecstr);
	}

	/** Set valid values for a given field */
	public setValidValues(block:string, field: string | string[], values: string[] | Set<any> | Map<any,any>) : void
	{
		this.getBlock(block)?.setValidValues(field,values);
	}

	/** Get the value of a given block, field
	*
	* @param block - The block containing the field.
   * @param field - The field for which to get the value.
   * @returns The value of the specified field in the specified block.
   */
	public getValue(block:string, field:string) : any
	{
		return(this.getBlock(block)?.getValue(field));
	}

	/** Set the value of a given block, field
	*
	* @param block - The block containing the field.
   * @param field - The field for which to set the value.
   * @param value - The value to set.
   */
	public setValue(block:string, field:string, value:any) : void
	{
		this.getBlock(block)?.setValue(field,value);
	}

	/** Flush all changes to the backend
	*
	* @returns A promise indicating whether the flushing was successful.
   */
	public async flush() : Promise<boolean>
	{
		return(FormBacking.getModelForm(this).flush());
	}

	/** Call another form in non modal mode
	*
	* @param form - The form class or name to call.
   * @param parameters - The parameters to pass to the form (optional).
   * @param container - The container to append the form to (optional).
   * @returns A promise containing the Form instance of the called form.
   */
	public async showform(form:Class<Form>|string, parameters?:Map<any,any>, container?:HTMLElement) : Promise<Form>
	{
		if (!await this.validate()) return(null);
		return(FormBacking.showform(form,null,parameters,container));
	}

	/** Call another form in modal mode */
	public async callform(form:Class<Form>|string, parameters?:Map<any,any>, container?:HTMLElement) : Promise<Form>
	{
		return(FormBacking.showform(form,this,parameters,container));
	}

	/** After changes to the HTML, reindexing is necessary */
	public reIndexFieldOrder() : void
	{
		FormBacking.getViewForm(this).rehash();
	}

	/** 'Labels' that points to fields can be repositioned by the user */
	public startFieldDragging() : void
	{
		let label:HTMLElement = Framework.getEvent().target;
		FormBacking.getViewForm(this).dragfields(label);
	}

	/** Replace the HTML. Change everything, delete all blocks and create new etc */
	public async setView(page:string|HTMLElement) : Promise<void>
	{
		let canvas:Canvas = this.canvas;
		let back:FormBacking = FormBacking.getBacking(this);

		if (page == null)
		{
			page = "";

			if (back.page == null)
				return;
		}

		if (canvas != null)
		{
			if (!this.validate())
			{
				Messages.warn(MSGGRP.FORM,2); // Form must be validated
				return;
			}

			if (FormBacking.getBacking(this).hasEventListeners())
				Messages.fine(MSGGRP.FORM,2); // Replacing view will remove all event listeners

			FormBacking.cleanup(this);
		}

		page = Framework.prepare(page);
		Framework.parse(this,page);
		back.page = page;

		if (canvas != null)
		{
			canvas.replace(page);
			FormBacking.getViewForm(this,true).canvas = canvas;
		}

		await FormBacking.getViewForm(this,true).finalize();
		await FormBacking.getModelForm(this,true).finalize();
	}

	/** Close the form. If force no validation will take place */
	public async close(force?:boolean) : Promise<boolean>
	{
		let vform:ViewForm = FormBacking.getViewForm(this);

		if (vform == null)
			return(true);

		if (!force && !await FormBacking.getModelForm(this).checkEventTransaction(EventType.OnCloseForm,null))
			return(false);

		if (!force && !await FormEvents.raise(FormEvent.FormEvent(EventType.OnCloseForm,this)))
			return(false);

		if (!await this.clear(force))
			return(false);

		this.canvas.close();

		let backing:FormBacking = FormBacking.getBacking(this);
		let parent:Form = backing.parent;

		if (parent != null)
		{
			await FormEvents.raise(FormEvent.FormEvent(EventType.OnFormEnabled,parent));
			parent.canvas?.unblock(); parent.focus();
			if (backing) backing.hasModalChild = false;
		}

		if (!force && !await FormEvents.raise(FormEvent.FormEvent(EventType.PostForm,this)))
			return(false);

		vform.setURL(true);
		FormBacking.removeBacking(this);

		if (force)
			return(true);

		let success:boolean = await FormEvents.raise(FormEvent.FormEvent(EventType.PostCloseForm,this));
		return(success);
	}

	/** Remove an eventlistener. This should also be done before setView is called */
	public removeEventListener(handle:object) : void
	{
		FormBacking.getBacking(this).removeEventListener(handle);
	}

	/** Add an eventlistener */
	public addEventListener(method:TriggerFunction, filter?:EventFilter|EventFilter[]) : object
	{
		let handle:object = FormEvents.addListener(this,this,method,filter);
		FormBacking.getBacking(this).listeners.push(handle);
		return(handle);
	}
}