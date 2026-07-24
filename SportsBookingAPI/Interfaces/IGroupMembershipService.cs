using SportsBookingAPI.DTOs;
using SportsBookingAPI.Services;

namespace SportsBookingAPI.Interfaces
{
    public interface IGroupMembershipService
    {
        Task<ServiceResult> RequestToJoinAsync(string userId, int groupId);
        Task<ServiceResult> InviteMemberAsync(string adminId, int groupId, InviteMemberDto inviteMemberDto);
        Task<ServiceResult> CancelInvitationAsync(string adminId, int groupId, string userId);
        Task<ServiceResult> RespondInviteAsync(string userId, RespondInviteDto respondInviteDto);
        Task<ServiceResult> RemoveMemberAsync(string userId, int groupId, string memberId);
        Task<ServiceResult> CancelJoinRequestAsync(string userId, int groupId);
        Task<ServiceResult> RespondJoinRequestAsync(string adminId, int groupId, RespondJoinRequestDto respondJoinRequestDto);
        Task<ServiceResult> GetMembershipStatusForAdminGroupsAsync(string adminId, string targetUserId);
        Task<ServiceResult> GetPendingJoinRequestsAsync(string adminId, int groupId);
        Task<ServiceResult> GetGroupMembershipsAsync(string adminId, int groupId);
        Task<ServiceResult> GetMyPendingInvitationsAsync(string userId);
        Task<ServiceResult> AdminRemoveMemberAsync(int groupId, string memberId);
    }
}
