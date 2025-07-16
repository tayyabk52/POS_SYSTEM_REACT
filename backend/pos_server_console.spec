# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['run_server.py'],
    pathex=[],
    binaries=[],
    datas=[('*.py', '.'), ('settings', 'settings'), ('inventory', 'inventory'), ('..\\database\\dataschema.sql', '.')],
    hiddenimports=['fastapi', 'uvicorn', 'pydantic', 'starlette', 'psycopg2', 'requests', 'psutil', 'dotenv', 'settings.crud', 'settings.api', 'settings.schemas', 'inventory.crud', 'inventory.api', 'inventory.schemas', 'database_exe', 'main_exe', 'database_setup'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='pos_server_console',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
