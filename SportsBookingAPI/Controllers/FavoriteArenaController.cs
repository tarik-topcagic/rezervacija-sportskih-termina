using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsBookingAPI.Interfaces;
using System.Security.Claims;

namespace SportsBookingAPI.Controllers
{
    [Route("api/favorites")]
    [ApiController]
    [Authorize]
    public class FavoriteArenaController : ControllerBase
    {
        private readonly IFavoriteArenaService _favoriteArenaService;

        public FavoriteArenaController(IFavoriteArenaService favoriteArenaService)
        {
            _favoriteArenaService = favoriteArenaService;
        }

        [HttpPost("{arenaId:int}")]
        public async Task<IActionResult> AddFavorite(int arenaId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _favoriteArenaService.AddFavoriteAsync(userId, arenaId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{arenaId:int}")]
        public async Task<IActionResult> RemoveFavorite(int arenaId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _favoriteArenaService.RemoveFavoriteAsync(userId, arenaId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _favoriteArenaService.GetMyFavoritesAsync(userId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
