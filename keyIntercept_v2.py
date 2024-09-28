from pynput import keyboard

# Create a keyboard controller
controller = keyboard.Controller()

def on_press(key):
    try:
        if key.char:
            if key.char.isalpha():
                # Send the uppercase version of the letter
                controller.press(key.char.upper())
                controller.release(key.char.upper())
            else:
                # Send the character as is (for non-letter characters)
                controller.press(key.char)
                controller.release(key.char)
    except AttributeError:
        # Handle special keys like space, enter, backspace
        if key == keyboard.Key.space:
            controller.press(key)
            controller.release(key)
        elif key == keyboard.Key.enter:
            controller.press(key)
            controller.release(key)
        elif key == keyboard.Key.backspace:
            controller.press(key)
            controller.release(key)
        # Add more special key handling if needed

def on_release(key):
    # Stop listener with ESC key
    if key == keyboard.Key.esc:
        return False

# Set up the listener for the keyboard with suppress=True
with keyboard.Listener(on_press=on_press, on_release=on_release, suppress=True) as listener:
    listener.join()
