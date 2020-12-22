/**
 *  Helper function to convert an onClick handler into all the necessary props for an accessible "clickable" element.
 *  This is useful when you would like button behaviour but cannot use a button element.
 * @param handlerFunc The handlerFunc which will be call onClick and on "Enter" pressed.
 */
export const buttonize = <T extends HTMLElement>(
    handlerFunc: (
        e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => void
) => {
    return {
        role: 'button',
        onClick: handlerFunc,
        tabIndex: 0,
        onKeyPress: (event: React.KeyboardEvent<T>) =>
            event.key === 'Enter' && handlerFunc(event),
    };
};
