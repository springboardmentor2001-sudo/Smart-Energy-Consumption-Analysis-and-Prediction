import subprocess

def check_tracking():
    print("Checking git tracking for node_modules...")
    try:
        # Check specific directory
        result = subprocess.run(["git", "ls-files", "UI/node_modules"], capture_output=True, text=True)
        files = result.stdout.strip().split('\n')
        count = len([f for f in files if f])
        
        if count > 0:
            print(f"WARNING: Found {count} tracked files in UI/node_modules!")
            print("First 5 files:")
            for f in files[:5]:
                print(f" - {f}")
        else:
            print("GOOD: UI/node_modules is NOT tracked.")
            
    except Exception as e:
        print(f"Error checking git: {e}")

if __name__ == "__main__":
    check_tracking()
