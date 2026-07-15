using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Controllers.Admin
{
    [Route("api/admin/reservations")]
    [ApiController]
    [Authorize(Policy = "RequireAdminRole")]
    public class AdminReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public AdminReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReservations(
            [FromQuery] int? arenaId,
            [FromQuery] string? username,
            [FromQuery] ReservationStatus? status)
        {
            var result = await _reservationService.GetAllReservationsForAdminAsync(arenaId, username, status);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var result = await _reservationService.AdminCancelReservationAsync(id);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
