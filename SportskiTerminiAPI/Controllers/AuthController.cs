using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
                return BadRequest(new { field = "username", message = "Korisničko ime je već u upotrebi." });

            var normalizedEmail = _userManager.NormalizeEmail(model.Email);
            var existingEmail = await _userManager.Users
                .AnyAsync(user => user.NormalizedEmail == normalizedEmail);
            if (existingEmail)
                return BadRequest(new { field = "email", message = "E-mail je već u upotrebi." });

            var existingPhoneNumber = await _userManager.Users
                .AnyAsync(user => user.PhoneNumber == model.PhoneNumber);
            if (existingPhoneNumber)
                return BadRequest(new { field = "phoneNumber", message = "Broj telefona je već u upotrebi." });

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

            var normalizedUsername = _userManager.NormalizeName(model.Username.Trim());
            var user = await _userManager.Users
                .SingleOrDefaultAsync(appUser => appUser.NormalizedUserName == normalizedUsername);

            if (user == null ||
                !string.Equals(user.UserName, model.Username.Trim(), StringComparison.Ordinal) ||
                !(await _userManager.CheckPasswordAsync(user, model.Password)))
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
