using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/gradovi")]
    [ApiController]
    public class GradController : ControllerBase
    {
        private readonly IGradRepository _gradRepository;

        public GradController(IGradRepository gradRepository)
        {
            _gradRepository = gradRepository;
        }

        [HttpPost("add-grad")]
        public async Task<IActionResult> DodajGrad([FromBody] GradDto gradDto)
        {
            if (gradDto == null || string.IsNullOrWhiteSpace(gradDto.Naziv) || string.IsNullOrWhiteSpace(gradDto.Kanton))
            {
                return BadRequest("Naziv and Kanton are required fields.");
            }

            var noviGrad = new Grad
            {
                Naziv = gradDto.Naziv,
                Kanton = gradDto.Kanton
            };

            var dodaniGrad = await _gradRepository.AddGradAsync(noviGrad);
            return Ok(dodaniGrad);
        }

        [HttpGet("get-gradovi")]
        public async Task<IActionResult> GetGradovi()
        {
            var gradovi = await _gradRepository.GetAllGradoviAsync();
            return Ok(gradovi);
        }
    }
}
