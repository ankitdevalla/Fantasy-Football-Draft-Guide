
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
        "Bench": 7
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
    elif player_position == "K" and user_roster["K"] < roster_structure["K"]:
        user_roster["K"] += 1
    elif player_position == "DST" and user_roster["DST"] < roster_structure["DST"]:
        user_roster["DST"] += 1
    elif player_position in user_roster and user_roster[player_position] < roster_structure[player_position]:
        user_roster[player_position] += 1
    elif user_roster["Bench"] < roster_structure["Bench"]:
        user_roster["Bench"] += 1
    else:
        print(f"No available roster spot for position {player_position}. Player goes to Bench.")
        user_roster["Bench"] += 1

    print(f"Updated user roster: {user_roster}")

# Function to get the position of a player from the DataFrame
def get_player_position(df, player_name):
    position = df.loc[df['PLAYER NAME'].str.lower() == player_name.lower(), 'POS'].values[0]
    return position