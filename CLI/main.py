from draft_simulation import *
from roster import *
from recommendation import recommend_players, display_recommended_players
from autopick import simulate_pick


if __name__ == "__main__":
    user_draft_position = get_user_draft_position()
    total_participants = get_total_participants()
    num_rounds = get_total_rounds()
    draft_tracker = initialize_draft_tracker(total_participants)
    available_players, original_names = initialize_available_players(df)
    roster_structure = define_roster_structure()  # Define the roster structure
    user_roster = initialize_user_roster()

    simulate_draft = input("Do you want to simulate the draft for other participants? (yes/no): ").strip().lower() == 'yes'


    # Example of how to use input_pick and update the user's roster

    for round_num in range(1, num_rounds + 1):
        print(f"\n--- Round {round_num} ---")

        if round_num % 2 != 0:  # Odd round: draft in normal order
            draft_order = range(1, total_participants + 1)
        else:  # Even round: draft in reverse order
            draft_order = range(total_participants, 0, -1)
        
        for participant in draft_order:
            if participant == user_draft_position:
                # Recommend players for the user's next pick
                available_df = df[df['PLAYER NAME'].str.lower().isin(available_players)].copy()
                top_10_players = available_df.sort_values(by='RK').head(10)
                print("\nTop 10 Available Players:")
                print(top_10_players[['PLAYER NAME', 'POS', 'RK', 'TIERS', 'AVG. POINTS ', 'SOS SEASON']].to_string(index=False))

                recommended_players = recommend_players(user_roster, available_players, df, roster_structure, top_n=3)
                display_recommended_players(recommended_players)
                
                # User makes a pick
                drafted_player = input_pick(participant, draft_tracker, available_players, original_names)
                player_position = get_player_position(df, drafted_player)
                update_user_roster(user_roster, player_position, roster_structure)
            else:
                if simulate_draft:
                    # Automatically simulate the pick for other participants
                    simulated_player, simulated_position = simulate_pick(available_players, df)
                    if simulated_player:
                        draft_tracker[participant].append(simulated_player)
                        available_players.remove(simulated_player.lower())
                        print(f"Participant {participant} selected {simulated_player} ({simulated_position}).")
                else:
                    # Manually input the pick for other participants
                    drafted_player = input_pick(participant, draft_tracker, available_players, original_names)
    
    print("\nFinal user roster:")
    print(user_roster)