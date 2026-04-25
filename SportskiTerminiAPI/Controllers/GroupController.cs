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
    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto groupDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _groupService.CreateGroupAsync(userId, groupDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpPut("{groupId}/update")]
        public async Task<IActionResult> UpdateGroup(int groupId, [FromBody] UpdateGroupDto updateGroupDto)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _groupService.UpdateGroupAsync(userId, groupId, updateGroupDto);
            return StatusCode(result.StatusCode, result.Payload);
        }

        [HttpGet("{groupId:int}")]
        public async Task<IActionResult> GetGroupDetails(int groupId)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var group = await _groupService.GetGroupDetailsAsync(userId, groupId);
            if (group == null)
                return NotFound("Group not found");

            return Ok(group);
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var groups = await _groupService.GetAdminGroupsAsync(userId);
            return Ok(groups);
        }

        [HttpGet("membership")]
        public async Task<IActionResult> GetMemberGroups()
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var groups = await _groupService.GetMemberGroupsAsync(userId);
            return Ok(groups);
        }

        [HttpGet("search-groups")]
        public async Task<IActionResult> SearchGroups([FromQuery] string? query)
        {
            var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var groups = await _groupService.SearchGroupsAsync(userId, query);
            return Ok(groups);
        }
    }
}
