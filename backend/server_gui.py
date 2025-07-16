import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading
import logging
import sys
import os
from datetime import datetime
import queue
import subprocess
import psutil
import requests
import time
import traceback
from database_setup import DatabaseSetup
from pathlib import Path

class ServerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("POS System Server")
        
        # Set full window mode
        self.root.state('zoomed')  # For Windows full-screen
        self.root.minsize(1200, 900)  # Minimum window size
        
        # Server state
        self.server_running = False
        self.server_thread = None
        self.server_process = None
        self.log_queue = queue.Queue()
        self.health_check_running = False
        self.database_setup = None
        
        # Setup GUI
        self.setup_gui()
        
        # Setup logging
        self.setup_logging()
        
        # Start log processing
        self.process_logs()
        
        # Setup health check
        self.start_health_check()
        
        # Check database status
        self.check_database_status()
        
    def setup_gui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Database setup frame
        db_frame = ttk.LabelFrame(main_frame, text="Database Setup", padding="10")
        db_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Database status
        self.db_status_label = ttk.Label(db_frame, text="Database Status: Unknown", foreground="gray")
        self.db_status_label.grid(row=0, column=0, sticky=tk.W, padx=(0, 20))
        
        # Database setup button
        self.db_setup_btn = ttk.Button(db_frame, text="Setup Database", command=self.show_setup_dialog)
        self.db_setup_btn.grid(row=0, column=1, padx=(0, 10))
        
        # Test database button
        self.db_test_btn = ttk.Button(db_frame, text="Test Connection", command=self.test_database)
        self.db_test_btn.grid(row=0, column=2, padx=(0, 10))
        
        # Server control frame
        control_frame = ttk.LabelFrame(main_frame, text="Server Control", padding="10")
        control_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Server status
        self.status_label = ttk.Label(control_frame, text="Server Status: Stopped", foreground="red")
        self.status_label.grid(row=0, column=0, sticky=tk.W, padx=(0, 20))
        
        # Health status
        self.health_label = ttk.Label(control_frame, text="Health: Unknown", foreground="gray")
        self.health_label.grid(row=0, column=1, sticky=tk.W, padx=(0, 20))
        
        # Start/Stop button
        self.start_stop_btn = ttk.Button(control_frame, text="Start Server", command=self.toggle_server)
        self.start_stop_btn.grid(row=0, column=2, padx=(0, 10))
        
        # Open browser button
        self.browser_btn = ttk.Button(control_frame, text="Open in Browser", command=self.open_browser, state="disabled")
        self.browser_btn.grid(row=0, column=3, padx=(0, 10))
        
        # Clear logs button
        self.clear_btn = ttk.Button(control_frame, text="Clear Logs", command=self.clear_logs)
        self.clear_btn.grid(row=0, column=4)
        
        # Server info frame
        info_frame = ttk.LabelFrame(main_frame, text="Server Information", padding="10")
        info_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Server info labels
        ttk.Label(info_frame, text="Host:").grid(row=0, column=0, sticky=tk.W)
        ttk.Label(info_frame, text="0.0.0.0").grid(row=0, column=1, sticky=tk.W, padx=(10, 0))
        
        ttk.Label(info_frame, text="Port:").grid(row=0, column=2, sticky=tk.W, padx=(20, 0))
        ttk.Label(info_frame, text="8000").grid(row=0, column=3, sticky=tk.W, padx=(10, 0))
        
        ttk.Label(info_frame, text="URL:").grid(row=1, column=0, sticky=tk.W)
        ttk.Label(info_frame, text="http://localhost:8000").grid(row=1, column=1, sticky=tk.W, padx=(10, 0), columnspan=3)
        
        # Debug frame
        debug_frame = ttk.LabelFrame(main_frame, text="Debug Information", padding="10")
        debug_frame.grid(row=3, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Debug info
        self.debug_label = ttk.Label(debug_frame, text="Debug: Ready", foreground="blue")
        self.debug_label.grid(row=0, column=0, sticky=tk.W)
        
        # Logs frame
        logs_frame = ttk.LabelFrame(main_frame, text="Server Logs", padding="10")
        logs_frame.grid(row=4, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Log text area
        self.log_text = scrolledtext.ScrolledText(logs_frame, wrap=tk.WORD, height=20)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(4, weight=1)
        logs_frame.columnconfigure(0, weight=1)
        logs_frame.rowconfigure(0, weight=1)
        
    def setup_logging(self):
        # Create custom log handler
        class QueueHandler(logging.Handler):
            def __init__(self, log_queue):
                super().__init__()
                self.log_queue = log_queue
                
            def emit(self, record):
                self.log_queue.put(self.format(record))
        
        # Setup logging without reconfiguring if already configured
        if not logging.getLogger().handlers:
            logging.basicConfig(level=logging.INFO)
        
        # Create queue handler
        queue_handler = QueueHandler(self.log_queue)
        queue_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
        
        # Add handler to root logger
        logging.getLogger().addHandler(queue_handler)
        
        # Add handler to uvicorn logger
        uvicorn_logger = logging.getLogger("uvicorn")
        uvicorn_logger.addHandler(queue_handler)
        
        # Initial log
        logging.info("POS System Server GUI Started")
        
    def process_logs(self):
        """Process log messages from queue and display in GUI"""
        try:
            while True:
                log_message = self.log_queue.get_nowait()
                self.log_text.insert(tk.END, log_message + "\n")
                self.log_text.see(tk.END)
        except queue.Empty:
            pass
        
        # Schedule next check
        self.root.after(100, self.process_logs)
        
    def check_database_status(self):
        """Check if database is properly configured"""
        try:
            from dotenv import load_dotenv
            load_dotenv()
            
            # Check if .env file exists
            env_file = os.path.join(os.path.dirname(__file__), ".env")
            if os.path.exists(env_file):
                # Try to connect to database
                import psycopg2
                conn = psycopg2.connect(
                    host=os.getenv('DB_HOST', 'localhost'),
                    port=os.getenv('DB_PORT', '5432'),
                    user=os.getenv('DB_USER', 'postgres'),
                    password=os.getenv('DB_PASS', 'admin'),
                    database=os.getenv('DB_NAME', 'POSSYSTEM')
                )
                conn.close()
                
                self.db_status_label.config(text="Database Status: Connected", foreground="green")
                self.debug_label.config(text="Debug: Database connection verified", foreground="green")
                logging.info("Database connection verified")
            else:
                self.db_status_label.config(text="Database Status: Not Configured", foreground="red")
                self.debug_label.config(text="Debug: Database not configured", foreground="red")
                logging.warning("Database not configured")
                
        except Exception as e:
            self.db_status_label.config(text="Database Status: Error", foreground="red")
            self.debug_label.config(text=f"Debug: Database error - {str(e)[:50]}", foreground="red")
            logging.error(f"Database status check failed: {e}")
    
    def show_setup_dialog(self):
        """Show database setup dialog"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Database Setup Wizard")
        dialog.geometry("700x700")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.geometry("+%d+%d" % (self.root.winfo_rootx() + 50, self.root.winfo_rooty() + 50))
        
        # Setup frame
        setup_frame = ttk.Frame(dialog, padding="20")
        setup_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(setup_frame, text="Database Setup Wizard", font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 20))
        
        # Instructions
        instructions_text = """This wizard will:
• Test PostgreSQL connection using your psql path
• Create the POS database
• Apply the database schema
• Configure environment variables

Please provide the PostgreSQL superuser password and path to psql.exe"""
        
        instructions = ttk.Label(setup_frame, text=instructions_text, justify=tk.LEFT, wraplength=650)
        instructions.pack(pady=(0, 20))
        
        # Password frame
        password_frame = ttk.Frame(setup_frame)
        password_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(password_frame, text="PostgreSQL Superuser Password:", font=("Arial", 10, "bold")).pack(anchor=tk.W)
        
        password_var = tk.StringVar()
        password_entry = ttk.Entry(password_frame, textvariable=password_var, show="*", width=60)
        password_entry.pack(fill=tk.X, pady=(5, 0))
        
        # Password validation
        password_validation = ttk.Label(password_frame, text="", foreground="red")
        password_validation.pack(anchor=tk.W, pady=(2, 0))
        
        # psql path frame
        psql_frame = ttk.Frame(setup_frame)
        psql_frame.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(psql_frame, text="Path to psql.exe:", font=("Arial", 10, "bold")).pack(anchor=tk.W)
        
        psql_var = tk.StringVar()
        psql_entry = ttk.Entry(psql_frame, textvariable=psql_var, width=60)
        psql_entry.pack(fill=tk.X, pady=(5, 0))
        
        # psql path validation
        psql_validation = ttk.Label(psql_frame, text="", foreground="red")
        psql_validation.pack(anchor=tk.W, pady=(2, 0))
        
        # Help text for psql path
        help_text = "Example: C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe"
        help_label = ttk.Label(psql_frame, text=help_text, font=("Arial", 8), foreground="gray")
        help_label.pack(anchor=tk.W, pady=(2, 0))
        
        # Progress frame
        progress_frame = ttk.Frame(setup_frame)
        progress_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.progress_var = tk.StringVar(value="Ready to setup")
        progress_label = ttk.Label(progress_frame, textvariable=self.progress_var, wraplength=650)
        progress_label.pack()
        
        self.progress_bar = ttk.Progressbar(progress_frame, mode='indeterminate')
        self.progress_bar.pack(fill=tk.X, pady=(5, 0))
        
        # Buttons frame
        button_frame = ttk.Frame(setup_frame)
        button_frame.pack(fill=tk.X)
        
        # Create buttons but don't pack yet
        self.proceed_btn = ttk.Button(button_frame, text="Proceed", 
                                     command=lambda: self.validate_and_proceed(dialog, password_var, psql_var, password_validation, psql_validation))
        self.setup_btn = ttk.Button(button_frame, text="Start Setup", 
                                   command=lambda: self.start_database_setup(dialog, password_var.get(), psql_var.get()),
                                   state="disabled")
        cancel_btn = ttk.Button(button_frame, text="Cancel", command=dialog.destroy)
        
        # Pack buttons
        self.proceed_btn.pack(side=tk.LEFT, padx=(0, 10))
        self.setup_btn.pack(side=tk.LEFT, padx=(0, 10))
        cancel_btn.pack(side=tk.RIGHT)
        
        # Focus on password entry
        password_entry.focus()
        
        # Bind Enter key to proceed
        password_entry.bind('<Return>', lambda e: self.validate_and_proceed(dialog, password_var, psql_var, password_validation, psql_validation))
        psql_entry.bind('<Return>', lambda e: self.validate_and_proceed(dialog, password_var, psql_var, password_validation, psql_validation))
        
    def validate_and_proceed(self, dialog, password_var, psql_var, password_validation, psql_validation):
        """Validate inputs and show proceed button"""
        password = password_var.get().strip()
        psql_path = psql_var.get().strip()
        
        # Clear previous validation messages
        password_validation.config(text="")
        psql_validation.config(text="")
        
        # Validate password
        if not password:
            password_validation.config(text="Please enter a password")
            return
        
        # Validate psql path
        if not psql_path:
            psql_validation.config(text="Please enter the path to psql.exe")
            return
        
        # Check if psql file exists
        psql_file = Path(psql_path)
        if not psql_file.exists():
            psql_validation.config(text="psql.exe not found at the specified path")
            return
        
        if not psql_file.is_file():
            psql_validation.config(text="Path is not a file")
            return
        
        # Hide proceed button and show setup button
        self.proceed_btn.pack_forget()
        self.setup_btn.pack(side=tk.LEFT, padx=(0, 10))
        self.setup_btn.config(state="normal")
        
        # Update progress
        self.progress_var.set("Inputs validated. Click 'Start Setup' to begin the database setup process.")
        
    def start_database_setup(self, dialog, password, psql_path):
        """Start the database setup process"""
        if not password or not psql_path:
            messagebox.showerror("Error", "Please provide both password and psql path")
            return
        
        # Disable setup button
        self.setup_btn.config(state="disabled")
        
        # Start progress bar
        self.progress_bar.start()
        
        # Start setup in thread
        def setup_thread():
            try:
                self.progress_var.set("Initializing database setup...")
                logging.info("Starting database setup process")
                
                # Create database setup instance
                self.database_setup = DatabaseSetup(logging.getLogger())
                
                # Run setup with detailed progress updates
                success, message = self.run_setup_with_progress(password, psql_path)
                
                # Update UI on main thread
                self.root.after(0, lambda: self.setup_completed(dialog, success, message))
                
            except Exception as e:
                error_msg = f"Setup failed: {str(e)}"
                logging.error(error_msg)
                self.root.after(0, lambda: self.setup_completed(dialog, False, error_msg))
        
        threading.Thread(target=setup_thread, daemon=True).start()
    
    def run_setup_with_progress(self, password, psql_path):
        """Run setup with detailed progress updates"""
        try:
            # Initialize database setup
            self.database_setup = DatabaseSetup(logging.getLogger())
            self.database_setup.postgres_password = password
            self.database_setup.psql_path = psql_path
            
            # Step 1: Validate psql path
            self.root.after(0, lambda: self.progress_var.set("Validating psql path..."))
            if not self.database_setup.validate_psql_path():
                return False, "Invalid psql path provided"
            
            # Step 2: Test PostgreSQL connection
            self.root.after(0, lambda: self.progress_var.set("Testing PostgreSQL connection..."))
            if not self.database_setup.test_postgresql_connection():
                return False, "Cannot connect to PostgreSQL. Please check if PostgreSQL is running and the password is correct."
            
            # Step 3: Create database
            self.root.after(0, lambda: self.progress_var.set("Creating database..."))
            if not self.database_setup.create_database():
                return False, "Failed to create database"
            
            # Step 4: Apply schema
            self.root.after(0, lambda: self.progress_var.set("Applying database schema..."))
            if not self.database_setup.apply_schema():
                return False, "Failed to apply database schema"
            
            # Step 5: Create .env file
            self.root.after(0, lambda: self.progress_var.set("Creating environment configuration..."))
            if not self.database_setup.create_env_file():
                return False, "Failed to create environment configuration"
            
            self.root.after(0, lambda: self.progress_var.set("Setup completed successfully!"))
            return True, "Database setup completed successfully"
            
        except Exception as e:
            error_msg = f"Database setup failed: {str(e)}"
            logging.error(error_msg)
            return False, error_msg
    
    def setup_completed(self, dialog, success, message):
        """Handle setup completion"""
        # Stop progress bar
        self.progress_bar.stop()
        
        # Re-enable setup button
        self.setup_btn.config(state="normal")
        
        if success:
            self.progress_var.set("Setup completed successfully!")
            messagebox.showinfo("Success", "Database setup completed successfully!")
            dialog.destroy()
            
            # Update database status
            self.check_database_status()
            
        else:
            self.progress_var.set(f"Setup failed: {message}")
            messagebox.showerror("Setup Failed", f"Database setup failed:\n{message}")
    
    def test_database(self):
        """Test database connection"""
        try:
            logging.info("Testing database connection...")
            self.debug_label.config(text="Debug: Testing database connection...", foreground="blue")
            
            from dotenv import load_dotenv
            load_dotenv()
            
            import psycopg2
            conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASS', 'admin'),
                database=os.getenv('DB_NAME', 'POSSYSTEM')
            )
            
            cur = conn.cursor()
            cur.execute("SELECT version()")
            version = cur.fetchone()
            
            cur.close()
            conn.close()
            
            self.debug_label.config(text=f"Debug: Database test successful - {version[0][:50]}", foreground="green")
            messagebox.showinfo("Success", f"Database connection successful!\nPostgreSQL version: {version[0]}")
            logging.info(f"Database test successful: {version[0]}")
            
        except Exception as e:
            error_msg = f"Database test failed: {str(e)}"
            self.debug_label.config(text=f"Debug: {error_msg[:50]}", foreground="red")
            messagebox.showerror("Error", f"Database test failed:\n{error_msg}")
            logging.error(error_msg)
    
    def start_health_check(self):
        """Start periodic health check of the server"""
        self.health_check_running = True
        self.perform_health_check()
        
    def perform_health_check(self):
        """Check if server is responding to requests"""
        if not self.health_check_running:
            return
            
        try:
            if self.server_running:
                # Try to connect to the server
                response = requests.get("http://localhost:8000/", timeout=2)
                if response.status_code == 200:
                    self.health_label.config(text="Health: OK", foreground="green")
                    self.debug_label.config(text=f"Debug: Server responding (Status: {response.status_code})", foreground="green")
                else:
                    self.health_label.config(text="Health: Warning", foreground="orange")
                    self.debug_label.config(text=f"Debug: Server responding but status {response.status_code}", foreground="orange")
            else:
                self.health_label.config(text="Health: Stopped", foreground="red")
                self.debug_label.config(text="Debug: Server not running", foreground="red")
        except requests.exceptions.RequestException as e:
            if self.server_running:
                self.health_label.config(text="Health: Error", foreground="red")
                self.debug_label.config(text=f"Debug: Server not responding - {str(e)}", foreground="red")
                logging.error(f"Health check failed: {str(e)}")
            else:
                self.health_label.config(text="Health: Stopped", foreground="red")
                self.debug_label.config(text="Debug: Server not running", foreground="red")
        
        # Schedule next health check
        self.root.after(5000, self.perform_health_check)
        
    def toggle_server(self):
        if self.server_running:
            self.stop_server()
        else:
            self.start_server()
            
    def start_server(self):
        try:
            logging.info("Starting FastAPI server...")
            self.status_label.config(text="Server Status: Starting...", foreground="orange")
            self.start_stop_btn.config(text="Starting...", state="disabled")
            self.debug_label.config(text="Debug: Initializing server...", foreground="blue")
            
            # Import and start server in thread
            def run_server():
                try:
                    logging.info("Importing FastAPI app...")
                    # Import the app
                    from main_exe import app
                    
                    logging.info("Configuring uvicorn server...")
                    # Configure uvicorn with detailed logging
                    import uvicorn
                    config = uvicorn.Config(
                        app=app,
                        host="0.0.0.0",
                        port=8000,
                        log_level="info",
                        access_log=True,
                        reload=False,  # Disable reload in production
                        loop="asyncio"
                    )
                    
                    logging.info("Creating uvicorn server...")
                    # Create and run server
                    server = uvicorn.Server(config)
                    logging.info("Starting uvicorn server...")
                    server.run()
                    
                except ImportError as e:
                    error_msg = f"Import error: {str(e)}"
                    logging.error(error_msg)
                    self.root.after(0, self.server_error, error_msg)
                except Exception as e:
                    error_msg = f"Server error: {str(e)}\nTraceback: {traceback.format_exc()}"
                    logging.error(error_msg)
                    self.root.after(0, self.server_error, error_msg)
                    
            # Start server thread
            self.server_thread = threading.Thread(target=run_server, daemon=True)
            self.server_thread.start()
            
            # Update UI after short delay
            self.root.after(3000, self.server_started)
            
        except Exception as e:
            error_msg = f"Failed to start server: {str(e)}"
            logging.error(error_msg)
            messagebox.showerror("Error", error_msg)
            self.server_error(error_msg)
            
    def server_started(self):
        """Called when server has started successfully"""
        self.server_running = True
        self.status_label.config(text="Server Status: Running", foreground="green")
        self.start_stop_btn.config(text="Stop Server", state="normal")
        self.browser_btn.config(state="normal")
        self.debug_label.config(text="Debug: Server started successfully", foreground="green")
        logging.info("Server started successfully on http://localhost:8000")
        
    def server_error(self, error_msg):
        """Called when server encounters an error"""
        self.server_running = False
        self.status_label.config(text="Server Status: Error", foreground="red")
        self.start_stop_btn.config(text="Start Server", state="normal")
        self.browser_btn.config(state="disabled")
        self.debug_label.config(text=f"Debug: Server error - {error_msg[:50]}...", foreground="red")
        
    def stop_server(self):
        try:
            logging.info("Stopping server...")
            self.server_running = False
            self.status_label.config(text="Server Status: Stopping...", foreground="orange")
            self.start_stop_btn.config(text="Stopping...", state="disabled")
            self.debug_label.config(text="Debug: Stopping server...", foreground="blue")
            
            # Kill any uvicorn processes
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if proc.info['name'] and 'uvicorn' in proc.info['name'].lower():
                        logging.info(f"Terminating uvicorn process {proc.info['pid']}")
                        proc.terminate()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # Wait a moment for processes to terminate
            time.sleep(1)
            
            # Force kill if still running
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if proc.info['name'] and 'uvicorn' in proc.info['name'].lower():
                        logging.info(f"Force killing uvicorn process {proc.info['pid']}")
                        proc.kill()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            self.status_label.config(text="Server Status: Stopped", foreground="red")
            self.start_stop_btn.config(text="Start Server", state="normal")
            self.browser_btn.config(state="disabled")
            self.debug_label.config(text="Debug: Server stopped", foreground="blue")
            logging.info("Server stopped successfully")
            
        except Exception as e:
            error_msg = f"Error stopping server: {str(e)}"
            logging.error(error_msg)
            self.debug_label.config(text=f"Debug: {error_msg}", foreground="red")
            
    def open_browser(self):
        try:
            import webbrowser
            webbrowser.open("http://localhost:8000")
            logging.info("Opened http://localhost:8000 in browser")
        except Exception as e:
            logging.error(f"Failed to open browser: {str(e)}")
            messagebox.showerror("Error", f"Failed to open browser: {str(e)}")
            
    def clear_logs(self):
        self.log_text.delete(1.0, tk.END)
        logging.info("Logs cleared")
        
    def on_closing(self):
        """Handle window closing"""
        self.health_check_running = False
        if self.server_running:
            self.stop_server()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = ServerGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop() 