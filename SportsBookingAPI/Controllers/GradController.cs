using Microsoft.AspNetCore.Mvc;
using SportsBookingAPI.DTOs;
using SportsBookingAPI.Interfaces;

namespace SportsBookingAPI.Controllers
{
    [Route("api/gradovi")]
    [ApiController]
    public class GradController : ControllerBase
    {
        private readonly IGradService _gradService;

        public GradController(IGradService gradService)
        {
            _gradService = gradService;
        }

        [HttpPost("add-grad")]
        public async Task<IActionResult> DodajGrad([FromBody] GradDto gradDto)
        {
            var result = await _gradService.AddGradAsync(gradDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("get-gradovi")]
        public async Task<IActionResult> GetGradovi()
        {
            var gradovi = await _gradService.GetAllGradoviAsync();
            return Ok(gradovi);
        }
    }
}
