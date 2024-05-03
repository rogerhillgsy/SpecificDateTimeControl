import { SpecificDateTime } from '../index';
import mock from "jest-mock-extended/lib/Mock";
import { IInputs } from "../generated/ManifestTypes";
import {screen, getByTestId, waitFor } from '@testing-library/dom';
import  '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

describe( 'Testing SpecificDatePicker functions', () => {
    const rbh_interactionId = "20000000-14fb-4fcb-93ea-bf3a7e0bdc25";

    var datePicker : SpecificDateTime;
    var container: HTMLDivElement;
    var outputChanged: jest.Mock<any,any,any>;
    var context: ComponentFramework.Context<IInputs>;
    beforeEach(()=>{
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



    test( 'Test basic SpecificDatePicker function', async () => {      
        // Expect datePicker to be undefined initially.
        const value1 = datePicker.getOutputs();
        expect(value1.SpecificDateTimeField).toBeUndefined();

        // Set the date - datePicker should still be undefined.
        const date = getByTestId(container,"date") as HTMLInputElement;
        await userEvent.type( date, '2024-02-28');
        
        await waitFor(() => expect(getByTestId(container,"date") as HTMLInputElement).toHaveValue('2024-02-28'));

        expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined();

        // Set the time - the output should now be defined, and outputChanges should have been called.
        expect(outputChanged).toHaveBeenCalledTimes(0);
        await userEvent.type(  getByTestId(container,"time"), '12:34');
        await waitFor(() => expect( datePicker.getOutputs()).toEqual(  { "SpecificDateTimeField" :  new Date( "2024-02-28T12:34")}));
        expect(outputChanged).toHaveBeenCalledTimes(1);
    }, 120*1000); // Timeout


    
    test( 'Test datePicker needs valid year', async () => {
        // Expect datePicker to be undefined initially.
        const value1 = datePicker.getOutputs();
        expect(value1.SpecificDateTimeField).toBeUndefined();

        // Set the time - the output should not yet be defined.
        await userEvent.type(  getByTestId(container,"time"), '12:34');
        await waitFor( () => expect( datePicker.getOutputs()).toEqual(  { "SpecificDateTimeField" :  undefined }));
        expect(outputChanged).not.toHaveBeenCalled();
        
        await ["2022-02-28","2023-31-12","2024-05-02"].forEach( async (invalidDate) => {
            // Set the date to invalid year - datePicker should still be undefined.
            const date = getByTestId(container,"date") as HTMLInputElement;
            await userEvent.type( date, invalidDate);
            
            await waitFor(() => expect(getByTestId(container,"date") as HTMLInputElement).toHaveValue(invalidDate));

            expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined();

            expect(outputChanged).not.toHaveBeenCalled();
        });

        const time = getByTestId(container,"time") as HTMLInputElement;
        await userEvent.type( time, "00:00");

        return ["2024-01-01","2024-05-01"].forEach( async (validDate) => {
            // Set the date to valid year - datePicker should still be undefined.
            const date = getByTestId(container,"date") as HTMLInputElement;
            await userEvent.type( date, validDate);
            
            await waitFor(() => expect(getByTestId(container,"date") as HTMLInputElement).toHaveValue(validDate));

            expect( datePicker.getOutputs().SpecificDateTimeField).not.toBeUndefined();

            expect(outputChanged).toHaveBeenCalledTimes(1);
        });
    });
});