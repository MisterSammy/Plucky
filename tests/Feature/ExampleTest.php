<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_redirects_to_players_when_no_active_player(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/players');
    }

    public function test_renders_practice_with_active_player(): void
    {
        $player = \App\Models\Player::create(['name' => 'Test', 'color' => '#ff0000', 'is_active' => true]);

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
