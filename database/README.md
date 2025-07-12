# Database

Place your .sql files and database scripts here for PostgreSQL integration.

---

## Database Setup Instructions

See the main project README for full setup, but in summary:

1. Install PostgreSQL and Python 3.
2. Install psycopg2: `pip install psycopg2`
3. Run the setup script:
   ```sh
   python setup_database.py
   ```
4. Follow the prompts for host, port, user, password, database name, and psql path.

---

## Troubleshooting

### **1. Error: server closed the connection unexpectedly**
**Message:**
```
Error connecting to PostgreSQL or creating database: server closed the connection unexpectedly
This probably means the server terminated abnormally before or while processing the request.
```
**Solution:**
-open sqlshell on windows (use the search feature of windows and just type sqlshell and you will have the console running)
- Double-check your username, password, and port.
- Try restarting PostgreSQL.
- Check PostgreSQL logs for more details.

### **2. Error: FileNotFoundError or Python traceback when running schema**
**Message:**
```
subprocess.run(psql_command, check=True, env=env)
FileNotFoundError: [WinError 2] The system cannot find the file specified
```
**Solution:**
- This means Python cannot find the `psql` executable.
- Make sure PostgreSQL is installed.
- Add the PostgreSQL `bin` folder (e.g., `C:\Program Files\PostgreSQL\15\bin`) to your system PATH, or enter the full path to `psql.exe` when prompted by the script.

-like this: ('C:\Program Files\PostgreSQL\17\bin\psql.exe')
- Test in terminal: `psql --version` or `"C:\Program Files\PostgreSQL\15\bin\psql.exe" --version`

### **3. General Tips**
- Always use the correct superuser password for PostgreSQL.
- If you get permission errors, try running your terminal as Administrator.
- If you still have issues, check the PostgreSQL logs or reinstall PostgreSQL.

---

If you encounter a new error, copy the full message and search online or ask for help with the details! 


This error is:

```
PermissionError: [WinError 5] Access is denied
```

This means **Python does not have permission to run the `psql` executable** (or possibly to access the file or directory).

---

## **How to Fix [WinError 5] Access is denied**

### **1. Run as Administrator**
- **Right-click** on your terminal (Command Prompt, PowerShell, or VSCode) and select **"Run as administrator"**.
- Then run your script again:
  ```sh
  python setup_database.py
  ```

### **2. Check the Path to `psql.exe`**
- Make sure the path you entered for `psql.exe` is correct and points to a real file.
- If you’re not sure, open the folder in File Explorer and right-click → Properties to check permissions.

### **3. Check File Permissions**
- Make sure your user account has permission to execute `psql.exe`.
- Right-click the file → Properties → Security tab → Make sure your user has "Read & execute" permission.

### **4. Antivirus/Defender**
- Sometimes antivirus or Windows Defender can block execution. Temporarily disable them and try again.

### **5. Path Issues**
- If you’re running from a network drive or a protected folder, try moving your project to a local folder like `C:\Users\<yourname>\POS_SYSTEM_REACT-main\database`.

---

## **Summary for Your README Troubleshooting**

> **Error: [WinError 5] Access is denied**
SOL:
> - Run your terminal as Administrator.
> - Double-check the path to `psql.exe` and make sure it is correct.
> - Make sure your user has permission to execute `psql.exe`.
> - Try moving your project to a local folder (not a network or protected folder).
> - Temporarily disable antivirus if it is blocking execution.

---

If you still get this error after these steps, please copy the **exact command you ran** and the **full path to `psql.exe`** you entered, and I can help further!