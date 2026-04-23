using System.ComponentModel.DataAnnotations;

namespace SportskiTerminiAPI.DTOs
{
    public class InviteMemberDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
    }
}
