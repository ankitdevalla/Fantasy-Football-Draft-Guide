import pandas as pd
from recommendation import recommend_players, display_recommended_players

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

# Define the roster structure using a map
def define_roster_structure():
    return {
        "QB": 1,
        "RB": 2,
        "WR": 2,
        "TE": 1,
        "FLEX": 1,
        "K": 1,
        "DST": 1,
        "Bench": 6
    }

# Initialize the user's roster tracking
def initialize_user_roster():
    return {
        "QB": 0,
        "RB": 0,
        "WR": 0,
        "TE": 0,
        "FLEX": 0,
        "K": 0,
        "DST": 0,
        "Bench": 0
    }

# Function to update the user's roster after drafting a player
def update_user_roster(user_roster, player_position, roster_structure):
    if player_position in ["RB", "WR", "TE"] and user_roster[player_position] < roster_structure[player_position]:
        user_roster[player_position] += 1
    elif player_position in ["RB", "WR", "TE"] and user_roster["FLEX"] < roster_structure["FLEX"]:
        user_roster["FLEX"] += 1
    elif player_position in user_roster and user_roster[player_position] < roster_structure[player_position]:
        user_roster[player_position] += 1
    elif user_roster["Bench"] < roster_structure["Bench"]:
        user_roster["Bench"] += 1
    elif user_roster["K"] < roster_structure["K"]:
        user_roster["K"] += 1
    elif user_roster["DST"] < roster_structure["DST"]:
        user_roster["DST"] += 1
    else:
        print(f"No available roster spot for position {player_position}. Player goes to Bench.")
        user_roster["Bench"] += 1

    print(f"Updated user roster: {user_roster}")

# Function to get the position of a player from the DataFrame
def get_player_position(df, player_name):
    position = df.loc[df['PLAYER NAME'].str.lower() == player_name.lower(), 'POS'].values[0]
    return position

if __name__ == "__main__":
    user_draft_position = get_user_draft_position()
    total_participants = get_total_participants()
    round_num = get_total_rounds()
    draft_tracker = initialize_draft_tracker(total_participants)
    available_players, original_names = initialize_available_players(df)
    roster_structure = define_roster_structure()  # Define the roster structure
    user_roster = initialize_user_roster()

    # Example of how to use input_pick and update the user's roster
    for round_num in range(1, round_num + 1):  # You can loop over multiple rounds
        for participant in range(1, total_participants + 1):
            # Check if it's the user's turn
            if participant == user_draft_position:
                # Recommend players for the user's next pick
                recommended_players = recommend_players(user_roster, available_players, df, roster_structure, top_n=3)
                display_recommended_players(recommended_players)
            
            # After recommendations, user makes a pick
            drafted_player = input_pick(participant, draft_tracker, available_players, original_names)
            
            if participant == user_draft_position:
                player_position = get_player_position(df, drafted_player)
                update_user_roster(user_roster, player_position, roster_structure)
    
    print("Final user roster:")
    print(user_roster)
