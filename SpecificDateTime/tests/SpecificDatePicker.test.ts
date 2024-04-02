import { SpecificDateTime } from '../index';
import mock from "jest-mock-extended/lib/Mock";
import { IInputs } from "../generated/ManifestTypes";
import {getByTestId, waitFor} from '@testing-library/dom';
import  '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

test(  'First test ', async () => {
    // Allow us to enter text into the controls.
    userEvent.setup();

    // Set up dependencies of the PCF control init function
    const  datePicker = new SpecificDateTime();
    const context = mock<ComponentFramework.Context<IInputs>>();
    const outputChanged = jest.fn(); // mock<() => void>();
    const state = mock<ComponentFramework.Dictionary>();

    document.body.innerHTML = '<div data-testid="container"></div>';
    const container = getByTestId( document.body, "container") as  HTMLDivElement;

    // Initialize the PCF control
    datePicker.init(context, outputChanged,state, container);

    // Update the control with a new value (null)
    context.parameters.SpecificDateTimeField = mock<IInputs["SpecificDateTimeField"]>();
    context.parameters.SpecificDateTimeField.raw = null;
    datePicker.updateView(context);

    // Check that control value really is undefined.
    await waitFor( () => expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined());

    // Now type in the date value and check that the date is still undefined.
    await userEvent.click(getByTestId(container,"date"));
    // userEvent.type(getByTestId(container,"date"), "23042024");
    await userEvent.type(getByTestId(container,"date"), "2024-04-23");
    await waitFor( () => expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined());

    // Type in the time value and check that the control now has a defined value.
    await userEvent.click(getByTestId(container,"time"));
    // userEvent.type(getByTestId(container,"time"), "1234");
    await userEvent.type(getByTestId(container,"time"), "12:34");
    await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toEqual(new Date("2024-04-23T12:34")));
})