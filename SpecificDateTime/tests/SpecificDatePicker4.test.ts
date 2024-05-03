import { SpecificDateTime } from '../index';
import mock from "jest-mock-extended/lib/Mock";
import { IInputs } from "../generated/ManifestTypes";
import { getByTestId, waitFor } from '@testing-library/dom';
import  '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

describe( 'Test min/max date features', () => {
    const rbh_interactionId = "20000000-14fb-4fcb-93ea-bf3a7e0bdc25";

    var datePicker : SpecificDateTime;
    var container: HTMLDivElement;
    var outputChanged: jest.Mock<any,any,any>;
    var context: ComponentFramework.Context<IInputs>;
    var state: ComponentFramework.Dictionary;
    beforeEach(()=>{
        userEvent.setup();
        datePicker = new SpecificDateTime();
        context = mock<ComponentFramework.Context<IInputs>>();
        (context as any).page = { entityTypeName: "rbhc_interaction", entityId: rbh_interactionId };
        context.userSettings = mock<ComponentFramework.UserSettings>();
        outputChanged = jest.fn(); // mock<() => void>();
        state = mock<ComponentFramework.Dictionary>();

        document.body.innerHTML = '<div data-testid="container"></div>';
        container = getByTestId(document.body, "container") as  HTMLDivElement;
        context.parameters.MinDate = mock<IInputs["MinDate"]>();
        context.parameters.MaxDate = mock<IInputs["MaxDate"]>();
        context.parameters.SpecificDateTimeField = mock<IInputs["SpecificDateTimeField"]>();
        context.parameters.SpecificDateTimeField.raw = null;
        return [datePicker, context, outputChanged, container];
    });

    test.each([
        ["Empty min/max", "", "", undefined, 0, undefined ],
        ["Absolute min date", "2024-04-03", "", "2024-04-02" , "2024-04-04", undefined ],
        ["Absolute max date", "", "2024-04-30", undefined , "2024-04-29", "2024-05-01" ],
        ["Absolute min/max date", "2024-04-03", "2024-05-15", "2024-04-03" , "2024-04-04", "2024-05-15" ],
        ["Relative min/max date", "-20", "0", -21, -1, +1],
        ["Relative min/max date - today", "-20", "1", -21 , 0, +10],
        ["Invalid date", "2024/04/03", "0", -30 , -1 , +1],
    ])( "%s Min/Max date functions", 
      async ( description: string, min: string, max: string, 
        expectedLow: number | string | undefined, expectedOk: number | string | undefined, expectedHigh: number | string | undefined ) => {

        context.parameters.MinDate.raw = min;
        context.parameters.MaxDate.raw = max;
        let expectedCalls = 0;

        datePicker.init(context, outputChanged,state, container);
        context.parameters.SpecificDateTimeField = mock<IInputs["SpecificDateTimeField"]>();
        context.parameters.SpecificDateTimeField.raw = null;
        datePicker.updateView(context);
        // Expect datePicker to be undefined initially.
        const value1 = datePicker.getOutputs();
        expect(value1.SpecificDateTimeField).toBeUndefined();

        await userEvent.clear(  getByTestId(container,"time"));       
        if (expectedLow !== undefined) {
            // Setting the date to the low value should not change the value.
            const lowDate = ( expectedLow as number ) ? relativeDate(expectedLow as number) :
                              expectedLow as string;
            await userEvent.clear(  getByTestId(container,"date"));
            await userEvent.click(  getByTestId(container,"date"));
            await userEvent.type(  getByTestId(container,"date"), lowDate);
            await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined());
            await userEvent.click(getByTestId(container,"time"));
            await userEvent.type(getByTestId(container,"time"), "12:35");       
            await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined());
            expect(outputChanged).toHaveBeenCalledTimes(0);
            expectedCalls ++;
        }

        if (expectedOk !== undefined) {
            // Setting the date to the low value should not change the value.
            const okDate = relativeDate(expectedOk);
            await userEvent.clear(  getByTestId(container,"date"));
            await userEvent.click(getByTestId(container,"date"));
            await userEvent.type(  getByTestId(container,"date"), okDate);
            await userEvent.clear(getByTestId(container,"time"));
            await userEvent.click(getByTestId(container,"time"));
            await userEvent.type(getByTestId(container,"time"), "12:35");     
            await new Promise( (r) => setTimeout(r,500));
            await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toEqual( new Date(`${okDate}T12:35`)));
            expectedCalls++;
            expect(outputChanged).toHaveBeenCalledTimes(expectedCalls);
        }

        if (expectedHigh !== undefined) {
            // Setting the date to the high value should not change the value. This shouldbe rejected.
            const highDate = relativeDate(expectedHigh);
            await userEvent.clear(  getByTestId(container,"date"));
            await userEvent.type(  getByTestId(container,"date"), highDate);
            await userEvent.click(getByTestId(container,"time"));
            await userEvent.type(getByTestId(container,"time"), "12:35");       
            await new Promise( (r) => setTimeout(r,500));
            await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined());
            expectedCalls +=3;
            expect(outputChanged).toHaveBeenCalledTimes(expectedCalls);
        }

    },1000*1000);
})

/**
 * Converts a parameter that is either a date string or a number offset from now into a date string.
 * @param offsetDays 
 * @returns 
 */
function relativeDate(offsetDays: number | string ) : string {
    const date = ( typeof(offsetDays) == 'number' ) ? new Date(Date.now() + (offsetDays as number) * 86400 * 1000).toISOString().split("T")[0] :
                 offsetDays as string;
    return date;
}

