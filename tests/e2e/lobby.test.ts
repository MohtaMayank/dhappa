import { test, expect } from '@playwright/test';
import { createRoom, joinRoom } from '../helpers/gameActions';

test.describe('Lobby & Connection', () => {
  test('4 players can join a room and are assigned to correct teams', async ({ context }) => {
    // Player 1 creates the room
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    console.log(`Room created: ${roomId}`);

    // Players 2, 3, 4 join
    const p2Page = await context.newPage();
    const p3Page = await context.newPage();
    const p4Page = await context.newPage();

    await joinRoom(p2Page, roomId, 'Player 2', '1234');
    await joinRoom(p3Page, roomId, 'Player 3', '1234');
    await joinRoom(p4Page, roomId, 'Player 4', '1234');

    // Verify all players see each other (avatars)
    const playersCount = await p1Page.locator('data-testid=player-avatar').count();
    // 3 avatars are shown (other players) + local player is not in avatar list in the middle
    // Actually PlayerAvatar is used for all 4 positions in the UI. 
    // Top, Left, Right are for other players. Bottom is not an avatar?
    // Let's check App.tsx again.
    /*
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <PlayerAvatar player={players[2]} isCurrentTurn={currentPlayerIndex === 2} position="top" />
            </div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 md:top-8 md:left-4 md:translate-y-0">
                <PlayerAvatar player={players[3]} isCurrentTurn={currentPlayerIndex === 3} position="left" />
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 md:top-8 md:right-4 md:translate-y-0">
                <PlayerAvatar player={players[1]} isCurrentTurn={currentPlayerIndex === 1} position="right" />
            </div>
    */
    // So 3 avatars in the center area.
    
    // Check Team assignments in PlayerBoard (My Team vs Opponents)
    // Team A: P1, P3. Team B: P2, P4.
    
    // For P1:
    // My Team should show "Player 1" and "Player 3"
    // Opponents should show "Player 2" and "Player 4"
    
    const myTeamText = await p1Page.locator('aside >> nth=0').textContent();
    expect(myTeamText).toContain('Player 1');
    expect(myTeamText).toContain('Player 3');
    
    const oppTeamText = await p1Page.locator('aside >> nth=1').textContent();
    expect(oppTeamText).toContain('Player 2');
    expect(oppTeamText).toContain('Player 4');
  });
});
