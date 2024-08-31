import pandas as pd

# Step 5.1: Develop the Player Recommendation Algorithm
def recommend_players(user_roster, available_players, df, roster_structure, top_n=3):
    # Filter available players and create a copy to avoid SettingWithCopyWarning
    available_df = df[df['PLAYER NAME'].str.lower().isin(available_players)].copy()

    # Initialize a scoring column with a compatible dtype (float)
    available_df['SCORE'] = 0.0

    # Score based on positional needs
    for position in ['QB', 'RB', 'WR', 'TE', 'K', 'DST']:
        position_weight = 2 if user_roster[position] < roster_structure[position] else 1.0
        available_df.loc[available_df['POS'] == position, 'SCORE'] += position_weight

    # Add other criteria to the score
    available_df['SCORE'] += available_df['AVG. POINTS '] * 0.5  # Weight for average points
    available_df['SCORE'] += (5 - available_df['SOS SEASON']) * 0.2  # Inverse weight for strength of schedule
    
    # Lower tiers are better, so use inverse (e.g., 1st tier = 15 points, 16th tier = 0 points)
    available_df['SCORE'] += (16 - available_df['TIERS']) * 1.0  # Higher tier gets higher score

    # Lower ranks are better, so use inverse (e.g., 1st rank = 100 points, 2nd rank = 99 points, etc.)
    max_rank = available_df['RK'].max()
    available_df['SCORE'] += (max_rank - available_df['RK']) * 0.5  # Higher rank (lower number) gets higher score

    # Sort by score and select the top N players
    recommended_players = available_df.sort_values(by='SCORE', ascending=False).head(top_n)

    return recommended_players[['PLAYER NAME', 'POS', 'RK', 'TIERS', 'AVG. POINTS ', 'SOS SEASON']]

# Step 5.2: Create a function to output the recommended players
def display_recommended_players(recommended_players):
    print("\nRecommended Players:")
    print(recommended_players.to_string(index=False))
