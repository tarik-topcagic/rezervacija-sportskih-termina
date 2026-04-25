using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using System.Security.Claims;

namespace SportskiTerminiAPI.Controllers
{
    [Route("api/groups")]
    [ApiController]
    [Authorize]
    public class GroupMembershipController : ControllerBase
    {
        private readonly IGroupMembershipService _groupMembershipService;

        public GroupMembershipController(IGroupMembershipService groupMembershipService)
        {
            _groupMembershipService = groupMembershipService;
        }

        [HttpPost("{groupId}/join-request")]
        public async Task<IActionResult> RequestToJoin(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupMembershipService.RequestToJoinAsync(userId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{groupId}/invite")]
        public async Task<IActionResult> InviteMember(int groupId, [FromBody] InviteMemberDto inviteMemberDto)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var result = await _groupMembershipService.InviteMemberAsync(adminId, groupId, inviteMemberDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{groupId}/invitations/{userId}")]
        public async Task<IActionResult> CancelInvitation(int groupId, string userId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var result = await _groupMembershipService.CancelInvitationAsync(adminId, groupId, userId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("respond-invite")]
        public async Task<IActionResult> RespondInvite([FromBody] RespondInviteDto respondInviteDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupMembershipService.RespondInviteAsync(userId, respondInviteDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{groupId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int groupId, string memberId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupMembershipService.RemoveMemberAsync(userId, groupId, memberId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpDelete("{groupId}/join-request")]
        public async Task<IActionResult> CancelJoinRequest(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupMembershipService.CancelJoinRequestAsync(userId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPost("{groupId}/respond-request")]
        public async Task<IActionResult> RespondJoinRequest(int groupId, [FromBody] RespondJoinRequestDto respondJoinRequestDto)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var result = await _groupMembershipService.RespondJoinRequestAsync(adminId, groupId, respondJoinRequestDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("admin/membership-status/{targetUserId}")]
        public async Task<IActionResult> GetMembershipStatusForAdminGroups(string targetUserId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var result = await _groupMembershipService.GetMembershipStatusForAdminGroupsAsync(adminId, targetUserId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("{groupId}/join-requests")]
        public async Task<IActionResult> GetPendingJoinRequests(int groupId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var result = await _groupMembershipService.GetPendingJoinRequestsAsync(adminId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("{groupId}/memberships")]
        public async Task<IActionResult> GetGroupMemberships(int groupId)
        {
            var adminId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (adminId == null)
                return Unauthorized();

            var result = await _groupMembershipService.GetGroupMembershipsAsync(adminId, groupId);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("invitations")]
        public async Task<IActionResult> GetMyPendingInvitations()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var result = await _groupMembershipService.GetMyPendingInvitationsAsync(userId);
            return StatusCode(result.StatusCode, result.Payload);
        }
    }
}
