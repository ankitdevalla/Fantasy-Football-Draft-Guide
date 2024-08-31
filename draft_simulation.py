import pandas as pd
from recommendation import recommend_players, display_recommended_players
from autopick import simulate_pick

# Load the cleaned CSV file
df = pd.read_csv('cleaned_fantasy_football_players.csv')

# Prompt the user for their draft position
def get_user_draft_position():
    while True:
        try:
            draft_position = int(input("Enter your draft position (e.g., 1 for 1st pick, 2 for 2nd pick): "))
            if draft_position < 1:
                raise ValueError
            return draft_position
        except ValueError:
            print("Please enter a valid positive integer for your draft position.")

# Prompt the user for how teams are in their league
def get_total_participants():
    while True:
        try:
            league_size = int(input("Enter how many teams are in your league: "))
            if league_size < 1:
                raise ValueError
            return league_size
        except ValueError:
            print("Please enter a valid positive integer for your league size.")

# Prompt the user for the number of rounds in the draft
def get_total_rounds():
    while True:
        try:
            total_rounds = int(input("Enter the number of rounds in the draft: "))
            if total_rounds < 1:
                raise ValueError
            return total_rounds
        except ValueError:
            print("Please enter a valid positive integer for the number of rounds.")

# Initialize a dictionary to keep track of drafted players
def initialize_draft_tracker(total_participants):
    # Initialize a dictionary where each participant (including the user) has an empty list of drafted players
    draft_tracker = {i: [] for i in range(1, total_participants + 1)}
    return draft_tracker

# Function to input each participant's pick
def input_pick(participant, draft_tracker, available_players, original_names):
    while True:
        player_name = input(f"Participant {participant}, enter the player you are picking: ").strip().lower()
        if player_name in available_players:
            original_name = original_names[player_name]
            draft_tracker[participant].append(original_name)
            available_players.remove(player_name)
            print(f"{original_name} has been drafted by Participant {participant}.")
            return original_name
        else:
            print(f"Player {player_name} is either already drafted or does not exist. Please try again.")

# Initialize the set of available players and a mapping for original names
def initialize_available_players(df):
    available_players = set(df['PLAYER NAME'].str.lower())
    original_names = {player_name.lower(): player_name for player_name in df['PLAYER NAME']}
    return available_players, original_names