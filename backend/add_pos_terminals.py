import requests
import json

API_BASE = 'http://localhost:8000'

def add_pos_terminals():
    """Add POS terminals for existing stores"""
    
    try:
        print("=== Adding POS Terminals ===\n")
        
        # 1. Get existing stores
        response = requests.get(f"{API_BASE}/inventory/stores")
        if response.status_code != 200:
            print(f"❌ Failed to get stores: {response.text}")
            return
            
        stores = response.json()
        print(f"Found {len(stores)} stores")
        
        # 2. Add terminal for each store
        for store in stores:
            store_id = store['store_id']
            store_name = store['store_name']
            
            # Check if terminal already exists
            response = requests.get(f"{API_BASE}/inventory/stores/{store_id}/terminals")
            if response.status_code == 200:
                terminals = response.json()
                if terminals:
                    print(f"⚠️  Terminal already exists for {store_name}")
                    continue
            
            # Add terminal
            terminal_data = {
                "store_id": store_id,
                "terminal_name": "Terminal 1",
                "ip_address": "192.168.1.100",
                "is_active": True
            }
            
            response = requests.post(f"{API_BASE}/inventory/stores/{store_id}/terminals", json=terminal_data)
            if response.status_code == 200:
                print(f"✅ Added terminal for {store_name}")
            else:
                print(f"❌ Failed to add terminal for {store_name}: {response.text}")
        
        print("\n✅ POS terminals setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_pos_terminals() 