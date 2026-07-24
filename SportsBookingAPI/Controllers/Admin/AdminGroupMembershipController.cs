using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportsBookingAPI.Interfaces;

namespace SportsBookingAPI.Controllers.Admin
{
    [Route("api/admin/groups/{groupId}/members")]
    [ApiController]
    [Authorize(Policy = "RequireAdminRole")]
    public class AdminGroupMembershipController : ControllerBase
    {
        private readonly IGroupMembershipService _groupMembershipService;

        public AdminGroupMembershipController(IGroupMembershipService groupMembershipService)
        {
            _groupMembershipService = groupMembershipService;
        }

        [HttpDelete("{memberId}")]
        public async Task<IActionResult> RemoveMember(int groupId, string memberId)
        {
            var result = await _groupMembershipService.AdminRemoveMemberAsync(groupId, memberId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
