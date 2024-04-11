// @ts-check
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class SpecificDateTime
    implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
    private _displayedDateValue?: Date;
    private _displayedTimeValue?: string;
    private _dateTimeValue?: Date;
    private _lastNotifiedValue?: Date;

    private _notifyOutputChanged: () => void;

    private dateInputElement: HTMLInputElement;
    private timeInputElement: HTMLInputElement;
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _dateRefreshed: (this: HTMLInputElement, evt: Event) => any;
    private _timeRefreshed: (this: HTMLInputElement, evt: Event) => any;

    /**
     * Empty constructor.
     */
    constructor() {}
    /**
     * called on UI updates to the date input field.
     * @param evt Update event for date field
     */
    private dateUpdated(evt: Event) {
        // Ensure that the date is treated as being in the UTC timezone. (Event if the user is not)
        this._displayedDateValue = new Date(this.dateInputElement.value);
        // if (!isNaN(this._displayedDateValue.getTime())) {
            // const dateElements = this.dateInputElement.value.split("-");
            // if (dateElements.length == 3 ) {
            //     const utCTimestamp = Date.UTC(+dateElements[0], +dateElements[1]-1, +dateElements[2]);
            //     this._displayedDateValue = new Date(utCTimestamp);
            // }
        // }
        this.updateDataModel();
    }
    
    /**
     * Called on UI updates to the time input field.
     * @param evt Update event for the time field
     */
    private timeUpdated(evt: Event) {
        this._displayedTimeValue = this.timeInputElement.value as any as string;
        this.updateDataModel();
    }

    /**
     * Determine if the parsed date/time value requires an update in the Model driven app stored value.
     */
    private updateDataModel() {
        this._dateTimeValue = this.parseDateTime();
        if (this._dateTimeValue != this._lastNotifiedValue) {
            this._lastNotifiedValue = new Date(this._dateTimeValue!!);
            this._notifyOutputChanged(); // Tell the model driven app framework that the control value has changed.
        }
    }

    /**
     * Try to parse the date and time fields into a valid value.
     * If the full date and time cannot be parse, return undefined.
     *
     * @returns currently displayed date (or undefined)
     */
    private parseDateTime(): Date | undefined {
        const date = this._displayedDateValue;
        const time = this._displayedTimeValue ?? "";
        const timeParts = time.split(":");
        if (
            date &&
            !isNaN(date.getTime()) &&
            timeParts.length == 2 &&
            date.getFullYear() >= 2023
        ) {
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            if (date && hours != undefined && minutes != undefined) {
                date.setHours(hours);
                date.setMinutes(minutes);
            }
            return date;
        }
        return undefined;
    }
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        const ONEDAY = 1000 * 86400;
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._dateRefreshed = this.dateUpdated.bind(this);
        this._timeRefreshed = this.timeUpdated.bind(this);

        // To display the control we create and populate a div with a date and time input control and then
        // attach to the "container" element passed in from the environment.
        this._container = document.createElement("div");
        this._container.setAttribute(
            "class",
            "form-control dateControlContainer"
        );

        this.dateInputElement = document.createElement("input");
        this.dateInputElement.setAttribute("type", "date");
        this.dateInputElement.addEventListener("input", this._dateRefreshed);
        this.dateInputElement.setAttribute("class", "dateControl");
        this.dateInputElement.setAttribute("id", "dateInput");
        this.dateInputElement.setAttribute("min", "2023-01-01");
        this.dateInputElement.setAttribute("data-testid", "date");
        const nextMonth = new Date(Date.now() + ONEDAY);
        this.dateInputElement.setAttribute(
            "max",
            nextMonth.toISOString().split("T")[0]
        );
        this.dateInputElement.setAttribute(
            "title",
            context.mode.isControlDisabled ? "disabled" : "enabled"
        );

        this.timeInputElement = document.createElement("input");
        this.timeInputElement.setAttribute("type", "time");
        this.timeInputElement.addEventListener("input", this._timeRefreshed);
        this.timeInputElement.setAttribute("class", "timeControl");
        this.timeInputElement.setAttribute("id", "timeInput");
        this.timeInputElement.setAttribute("data-testid", "time");
        this.timeInputElement.setAttribute(
            "title",
            "Enter the time in 24 hour format hh:mm"
        );

        this._container.appendChild(this.dateInputElement);
        this._container.appendChild(this.timeInputElement);
        container.appendChild(this._container);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Update the date/time value if needed.
        this._context = context;
        if (context.parameters.SpecificDateTimeField.raw) {
            this._dateTimeValue = context.parameters.SpecificDateTimeField.raw!;
            this._displayedDateValue = this._dateTimeValue;
            this._lastNotifiedValue = new Date(this._dateTimeValue);
            this._displayedTimeValue = `${this._dateTimeValue
                .getHours()
                .toString()
                .padStart(2, "0")}:${this._dateTimeValue
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;
        } else {
            // Undefined datetime value. Set to current date with empty time field
            this._dateTimeValue = undefined;
            this._displayedDateValue = this._dateTimeValue;
            this._displayedTimeValue = "";
        }
        this.dateInputElement.value =
            this._dateTimeValue?.toISOString().split("T")[0] ?? "";
        this.timeInputElement.value = this._displayedTimeValue ?? "";

        // Deal with control being enabled/disabled.
        this.dateInputElement.readOnly = context.mode.isControlDisabled;
        this.timeInputElement.readOnly = context.mode.isControlDisabled;
    }

    /**
     * Called by the framework to get the current value of the control.
     * The time returned needs to be adjusted for the locale and the 
     *
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        let adjustedDate = !this._dateTimeValue ? undefined : new Date(this._dateTimeValue);
        if (adjustedDate) {
            let adjustedTimestamp = adjustedDate.getTime() - adjustedDate.getTimezoneOffset()*1000*60;
            adjustedDate = new Date(adjustedTimestamp);
        }
        return {
            SpecificDateTimeField: adjustedDate,
        };
    }

    /**
     * Remove event listers on the date and time controls.
     */
    public destroy(): void {
        this.dateInputElement.removeEventListener("input", this._dateRefreshed);
        this.timeInputElement.removeEventListener("input", this._timeRefreshed);
    }
}
