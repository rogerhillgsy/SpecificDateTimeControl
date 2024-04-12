import { SpecificDateTime } from '../index';
import mock from "jest-mock-extended/lib/Mock";
import { IInputs } from "../generated/ManifestTypes";
import {getByTestId, waitFor} from '@testing-library/dom';
import  '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// it.each( ['2024-03-11','2024-04-11'])( '%i should provide basic function', (date) => {
    
// })

test.each( ['2024-03-11','2024-04-11'])(  '%s Basic Test', async (date) => {
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
    await userEvent.type(getByTestId(container,"date"), date);
    await waitFor( () => expect( datePicker.getOutputs().SpecificDateTimeField).toBeUndefined());

    // Type in the time value and check that the control now has a defined value.
    await userEvent.click(getByTestId(container,"time"));
    // userEvent.type(getByTestId(container,"time"), "1234");
    await userEvent.type(getByTestId(container,"time"), "12:34");

    // Note that the testing-library framework is operating without a specific locale. 
    // new Date(xxx) will apply the current timezone to the date literal we specify
    // (which will cause an error unless you are in GMT+0.)
    // Explicity specifying the timezone as "Z" fixes this problem.
    await waitFor(() => expect( datePicker.getOutputs().SpecificDateTimeField).toEqual( new Date( `${date}T12:34`)));
}, 120*1000)