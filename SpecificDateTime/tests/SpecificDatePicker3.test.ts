import { SpecificDateTime } from '../index';
import mock from "jest-mock-extended/lib/Mock";
import { IInputs } from "../generated/ManifestTypes";
import {screen, getByTestId, waitFor } from '@testing-library/dom';
import  '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

/**
 * Very similar to SpecificDatePicker2.test, but split out as the testing library seems to have
 * problems with side-effects between different tests.
 */
describe( 'Testing Clearing the SpecificDatePicker', () => {
    const rbh_interactionId = "20000000-14fb-4fcb-93ea-bf3a7e0bdc25";

    var datePicker : SpecificDateTime;
    var container: HTMLDivElement;
    var outputChanged: jest.Mock<any,any,any>;
    var context: ComponentFramework.Context<IInputs>;
    beforeEach(() => {
        userEvent.setup();

        datePicker = new SpecificDateTime();
        context = mock<ComponentFramework.Context<IInputs>>();
        (context as any).page = { entityTypeName: "rbhc_interaction", entityId: rbh_interactionId };
        context.userSettings = mock<ComponentFramework.UserSettings>();
        outputChanged = jest.fn(); // mock<() => void>();
        const state = mock<ComponentFramework.Dictionary>();

        document.body.innerHTML = '<div data-testid="container"></div>';
        container = screen.getByTestId("container") as  HTMLDivElement;
        context.parameters.MinDate = mock<IInputs["MinDate"]>();
        context.parameters.MaxDate = mock<IInputs["MaxDate"]>();
        context.parameters.MinDate.raw = '2024-01-01T00:00';
        context.parameters.MaxDate.raw = '2024-05-01T00:00';
        
        datePicker.init(context, outputChanged,state, container);

        context.parameters.SpecificDateTimeField = mock<IInputs["SpecificDateTimeField"]>();
        context.parameters.SpecificDateTimeField.raw = null;
        datePicker.updateView(context);

        return [datePicker, context, outputChanged, container];
    });
    
     test.each( [[-300,"10:57"],[0,"15:57"], [600,"01:57"]])( 'TzOffset: %s Clearing date field should update date to be undefined',
       async (tzOffset: number, expectedTime: string ) => {
        context.userSettings.getTimeZoneOffsetMinutes = jest.fn().mockImplementation(()=>{return tzOffset}); 

        // Expect datePicker to be undefined initially.
        expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined();

        // Set date and time from environment.
        context.parameters.SpecificDateTimeField.raw = new Date("2024-03-26T15:57");
        datePicker.updateView(context);

        // Check that date is set as expected
        await waitFor( () => expect( datePicker.getOutputs()).toEqual(  { "SpecificDateTimeField" :  new Date("2024-03-26T15:57") }));
        expect(outputChanged).not.toHaveBeenCalled();

        // Clear the date field. OutputChanged should have been called once and getOutputs() should be returning undefined.
        await userEvent.clear( getByTestId(container,"date"));
        expect(outputChanged).toHaveBeenCalledTimes(1);
        expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined();

        // However, the time field should still have a value, and date should be clear.
        await waitFor(() => expect(getByTestId(container,"time") as HTMLInputElement).toHaveValue(expectedTime));
        await waitFor(() => expect(getByTestId(container,"date") as HTMLInputElement).not.toHaveValue());
        expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined();

        // Setting the date to a value should restore the getOutputs() value
        await userEvent.type(  getByTestId(container,"date"), '2024-02-29');
        await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toEqual(  new Date(`2024-02-29T${expectedTime}`) ));
        expect(outputChanged).toHaveBeenCalledTimes(2);
    });
});