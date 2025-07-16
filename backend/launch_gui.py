#!/usr/bin/env python3
"""
POS System Server GUI Launcher
This script launches the server with a GUI interface.
"""

import tkinter as tk
from server_gui import ServerGUI

def main():
    """Launch the GUI server"""
    root = tk.Tk()
    app = ServerGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main() 