import pandas as pd

# Load the cleaned CSV file
df = pd.read_csv('cleaned_fantasy_football_players.csv')

# Step 2.1: Prompt the user for their draft position
def get_user_draft_position():
    while True:
        try:
            draft_position = int(input("Enter your draft position (e.g., 1 for 1st pick, 2 for 2nd pick): "))
            if draft_position < 1:
                raise ValueError
            return draft_position
        except ValueError:
            print("Please enter a valid positive integer for your draft position.")

# Step 2.1: Prompt the user for how teams are in their league
def get_user_league_size():
    while True:
        try:
            league_size = int(input("Enter how many teams are in your league: "))
            if league_size < 1:
                raise ValueError
            return league_size
        except ValueError:
            print("Please enter a valid positive integer for your league size.")

# Step 2.2: Initialize a dictionary to keep track of drafted players
def initialize_draft_tracker(total_participants):
    # Initialize a dictionary where each participant (including the user) has an empty list of drafted players
    draft_tracker = {i: [] for i in range(1, total_participants + 1)}
    return draft_tracker

# Example usage
if __name__ == "__main__":
    user_draft_position = get_user_draft_position()
    total_participants = get_user_league_size()  
    draft_tracker = initialize_draft_tracker(total_participants)

    print(f"Your draft position is: {user_draft_position}")
    print(f"Your league size is: {total_participants}")
    print("Draft tracker initialized.")
    print(draft_tracker)
