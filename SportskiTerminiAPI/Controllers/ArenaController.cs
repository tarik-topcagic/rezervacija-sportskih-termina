using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.Interfaces;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/arenas")]
    [ApiController]
    public class ArenaController : ControllerBase
    {
        private readonly IArenaService _arenaService;

        public ArenaController(IArenaService arenaService)
        {
            _arenaService = arenaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetArenas([FromQuery] string? city, [FromQuery] string? sportType, [FromQuery] string? searchTerm)
        {
            var arenas = await _arenaService.GetArenasAsync(city, sportType, searchTerm);
            return Ok(arenas);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetArenaById(int id)
        {
            var arena = await _arenaService.GetArenaByIdAsync(id);
            if (arena == null)
                return NotFound();

            return Ok(arena);
        }
    }
}
