def simulate_pick(available_players, df):
    # Filter the DataFrame for available players and sort by ADP (lower ADP is better)
    available_df = df[df['PLAYER NAME'].str.lower().isin(available_players)].copy()
    available_df.sort_values(by='RK', inplace=True)

    # Pick the player with the lowest ADP (first in the sorted list)
    if not available_df.empty:
        selected_player = available_df.iloc[0]
        return selected_player['PLAYER NAME'], selected_player['POS']
    return None, None