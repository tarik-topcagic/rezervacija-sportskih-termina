namespace SportskiTerminiAPI.DTOs
{
    public class CreatePrivateMessageDto
    {
        public string MessageText { get; set; } = string.Empty;
        public int? ReplyToMessageId { get; set; }
    }
}
