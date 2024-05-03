// @ts-check
import { IInputs, IOutputs } from "./generated/ManifestTypes";

/**
 * The specific Date Time PCF control performs a similar function to the Out of the Box date time control 
 * in model driven apps.
 * The main difference is that it will not automatically fill the a time component to a default value of "08:00" when the date has been entered.
 * Instead the time value must be entered explicity.
 */
export class SpecificDateTime implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _displayedDateValue?: Date;
    private _displayedTimeValue?: string;
    private _dateTimeValue?: Date;
    private _lastNotifiedValue?: Date;

    private _earliestDate?: Date;
    private _latestDate?: Date;

    private _notifyOutputChanged: () => void;

    private dateInputElement: HTMLInputElement;
    private timeInputElement: HTMLInputElement;
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _dateRefreshed: (this: HTMLInputElement, evt: Event) => any;
    private _timeRefreshed: (this: HTMLInputElement, evt: Event) => any;

    private static readonly TIMESTAMP_MINUTE = 1000 * 60;

    /**
     * Empty constructor.
     */
    constructor() {}
    /**
     * Utility function to provide a promise that "debounces" user entered time input.
     * @param ms
     * @returns
     */
    private debouncer = ((delay: number): (() => Promise<void>) => {
        let timeout: number | undefined = undefined;
        return () => {
            if (timeout) {
                window.clearTimeout(timeout);
            }
            return new Promise((resolve) => {
                timeout = window.setTimeout(resolve, delay);
            });
        };
    })(300); // Allow pause of up to 300ms between keystrokes swhen entering time values.
    /**
     * called on UI updates to the date input field.
     * @param evt Update event for date field
     */
    private dateUpdated(evt: Event) {
        this.updateDataModel();
    }

    /**
     * Called on UI updates to the time input field.
     * @param evt Update event for the time field
     */
    private timeUpdated(evt: Event) {
        this._displayedTimeValue = this.timeInputElement.value; // as any as string;
        // Debounce the entry of time so that the user can enter the time in a more natural way
        this.debouncer().then(() => this.updateDataModel());
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
     * If the full date and time cannot be parsed, return undefined.
     * We need to be quite careful here to construct the date as entered by the user. This will give us a "point in time"
     * that is correct (from the user's point of view).
     *
     * @returns currently displayed date (or undefined)
     */
    private parseDateTime(): Date | undefined {
        if (this.dateInputElement.value && this.timeInputElement.value) {
            const dateParts = this.dateInputElement.value ? this.dateInputElement.value.split("-") : undefined;
            const timeParts = this.timeInputElement.value.split(":");
            if (dateParts && dateParts.length == 3 && timeParts && timeParts.length == 2) {
                const date = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2], +timeParts[0], +timeParts[1]);
                if (
                    (!this._earliestDate || date >= this._earliestDate) &&
                    (!this._latestDate || date <= this._latestDate)
                ) {
                    return date;
                }
                return undefined;
            }
        }
        return undefined;
    }

    /**
     *
     * @param input Process the input "date" parameter that will be either a date (in a format recognised by the
     *              Javascript Date() constructor) or an offset in days from the current date.
     * @returns
     */
    private processDateParameter(input: string | undefined): Date | undefined {
        let date: Date | undefined = undefined;
        if (input) {
            // If the input is a number
            const offset = Number(input);
            if (Number.isNaN(offset)) {
                date = new Date(input);
            } else {
                date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000);
            }
            return date;
        }
        return date;
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

        this._earliestDate = this.processDateParameter(context.parameters.MinDate?.raw ?? undefined);
        this._latestDate = this.processDateParameter(context.parameters.MaxDate?.raw ?? undefined);

        // To display the control we create and populate a div with a date and time input control and then
        // attach to the "container" element passed in from the environment.
        this._container = document.createElement("div");
        this._container.setAttribute("class", "form-control dateControlContainer");

        this.dateInputElement = document.createElement("input");
        this.dateInputElement.setAttribute("type", "date");
        this.dateInputElement.addEventListener("input", this._dateRefreshed);
        this.dateInputElement.setAttribute("class", "dateControl");
        this.dateInputElement.setAttribute("id", "dateInput");
        this.dateInputElement.setAttribute("min", this._earliestDate?.toISOString().split("T")[0] ?? "");
        this.dateInputElement.setAttribute("data-testid", "date");
        this.dateInputElement.setAttribute("max", this._latestDate?.toISOString().split("T")[0] ?? "");
        const title = "test"; // `Enter a date between ${this._earliestDate} and ${this._latestDate}`;
        this.dateInputElement.setAttribute("title", title);

        this.timeInputElement = document.createElement("input");
        this.timeInputElement.setAttribute("type", "time");
        this.timeInputElement.addEventListener("input", this._timeRefreshed);
        this.timeInputElement.setAttribute("class", "timeControl");
        this.timeInputElement.setAttribute("id", "timeInput");
        this.timeInputElement.setAttribute("data-testid", "time");
        this.timeInputElement.setAttribute("title", "Enter the time in 24 hour format hh:mm");

        this._container.appendChild(this.dateInputElement);
        this._container.appendChild(this.timeInputElement);
        container.appendChild(this._container);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     *
     * Note that we need to be very careful here with the date value returned from the PCF framework. This will **not** be the same as the one we returned from getOutputs().
     * It needs to be adjusted by the CRM user's timezone offset and the locale timezone offset before we try to use it in the control.
     *
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Update the date/time value if needed.
        this._context = context;
        let displayedDateString: string = "";
        if (context.parameters.SpecificDateTimeField.raw) {
            this._dateTimeValue = context.parameters.SpecificDateTimeField.raw;
            // The timestamp of raw value returned by the framework != the timestamp of the time that getOutput returns. :-(((
            this._displayedDateValue = new Date(
                this._dateTimeValue.getTime() +
                    (context.userSettings.getTimeZoneOffsetMinutes(this._dateTimeValue) +
                        this._dateTimeValue.getTimezoneOffset()) *
                        SpecificDateTime.TIMESTAMP_MINUTE
            );
            this._lastNotifiedValue = new Date(this._displayedDateValue);
            this._displayedTimeValue = `${this._displayedDateValue
                .getHours()
                .toString()
                .padStart(2, "0")}:${this._displayedDateValue.getMinutes().toString().padStart(2, "0")}`;
            // We need a ISO format date, but toISOString() applies time zone correction, which is not needed here.
            displayedDateString = `${this._displayedDateValue.getFullYear()}-${(this._displayedDateValue.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${this._displayedDateValue.getDate().toString().padStart(2, "0")}`;
        } else {
            // Undefined datetime value. Set to current date with empty time field
            this._dateTimeValue = undefined;
            this._lastNotifiedValue = undefined;
            this._displayedDateValue = this._dateTimeValue;
            this._displayedTimeValue = "";
        }
        this.dateInputElement.value = displayedDateString;
        this.timeInputElement.value = this._displayedTimeValue ?? "";

        // Deal with control being enabled/disabled.
        this.dateInputElement.readOnly = context.mode.isControlDisabled;
        this.timeInputElement.readOnly = context.mode.isControlDisabled;
    }

    /**
     * Called by the framework to get the current value of the control.
     * The date time value returned to the CRM framework will be correct for the user's locale.
     * Note that the value we get back from the CRM framework in UpdateView() will have been adjusted for the user's locale and
     * any CRM date time settings, so may be quite different(!)
     *
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        let adjustedDate = !this._dateTimeValue ? undefined : new Date(this._dateTimeValue);
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
