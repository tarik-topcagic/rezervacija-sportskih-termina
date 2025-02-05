using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;
using System.Net.WebSockets;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        public AuthController(UserManager<AppUser> userManager, IConfiguration configuration, SignInManager<AppUser> signInManager, 
            ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _userManager.FindByNameAsync(model.Username);
            if (existingUser != null)
                return BadRequest(new { message = "Username is already taken." });

            var user = new AppUser
            {
                FullName = model.FullName,
                UserName = model.Username,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Registration successful" });

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByNameAsync(model.Username);

            if (user == null || !(await _userManager.CheckPasswordAsync(user, model.Password)))
                return Unauthorized("Invalid login attempt");

            var token = await _tokenService.GenerateJwtToken(user);

            return Ok(new 
            { 
                Token = token,
                Username = user.UserName,
                FullName = user.FullName,
            });
        }
    }
}
