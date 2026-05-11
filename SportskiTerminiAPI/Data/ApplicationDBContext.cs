using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
            

        }
        public DbSet<Grad> Gradovi { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<GroupMessageReceipt> GroupMessageReceipts { get; set; }
        public DbSet<GroupChatReadState> GroupChatReadStates { get; set; }
        public DbSet<PrivateConversation> PrivateConversations { get; set; }
        public DbSet<PrivateMessage> PrivateMessages { get; set; }
        public DbSet<PrivateChatReadState> PrivateChatReadStates { get; set; }
        public DbSet<AppNotification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>()
                .Property(user => user.LanguagePreference)
                .HasDefaultValue("bs")
                .HasMaxLength(8);

            modelBuilder.Entity<Group>()
                .HasOne(g => g.Admin)
                .WithMany(u => u.Groups)
                .HasForeignKey(g => g.AdminId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<GroupMembership>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupMemberships)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<GroupMembership>()
                .HasOne(gm => gm.group)
                .WithMany(g => g.Memberships)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMembership>()
                .HasIndex(gm => new { gm.GroupId, gm.UserId })
                .IsUnique();

            modelBuilder.Entity<GroupMessage>()
                .HasOne(message => message.Group)
                .WithMany(group => group.GroupMessages)
                .HasForeignKey(message => message.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMessage>()
                .HasOne(message => message.SenderUser)
                .WithMany(user => user.GroupMessages)
                .HasForeignKey(message => message.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMessage>()
                .HasIndex(message => new { message.GroupId, message.CreatedAt });

            modelBuilder.Entity<GroupMessageReceipt>()
                .HasOne(receipt => receipt.GroupMessage)
                .WithMany(message => message.Receipts)
                .HasForeignKey(receipt => receipt.GroupMessageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMessageReceipt>()
                .HasOne(receipt => receipt.User)
                .WithMany(user => user.GroupMessageReceipts)
                .HasForeignKey(receipt => receipt.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMessageReceipt>()
                .HasIndex(receipt => new { receipt.GroupMessageId, receipt.UserId })
                .IsUnique();

            modelBuilder.Entity<GroupChatReadState>()
                .HasOne(readState => readState.Group)
                .WithMany()
                .HasForeignKey(readState => readState.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupChatReadState>()
                .HasOne(readState => readState.User)
                .WithMany()
                .HasForeignKey(readState => readState.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupChatReadState>()
                .HasIndex(readState => new { readState.GroupId, readState.UserId })
                .IsUnique();

            modelBuilder.Entity<PrivateConversation>()
                .HasOne(conversation => conversation.UserOne)
                .WithMany(user => user.PrivateConversationsAsUserOne)
                .HasForeignKey(conversation => conversation.UserOneId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PrivateConversation>()
                .HasOne(conversation => conversation.UserTwo)
                .WithMany(user => user.PrivateConversationsAsUserTwo)
                .HasForeignKey(conversation => conversation.UserTwoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PrivateConversation>()
                .HasIndex(conversation => new { conversation.UserOneId, conversation.UserTwoId })
                .IsUnique();

            modelBuilder.Entity<PrivateMessage>()
                .HasOne(message => message.Conversation)
                .WithMany(conversation => conversation.PrivateMessages)
                .HasForeignKey(message => message.ConversationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PrivateMessage>()
                .HasOne(message => message.SenderUser)
                .WithMany(user => user.PrivateMessages)
                .HasForeignKey(message => message.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PrivateMessage>()
                .HasIndex(message => new { message.ConversationId, message.CreatedAt });

            modelBuilder.Entity<PrivateChatReadState>()
                .HasOne(readState => readState.Conversation)
                .WithMany()
                .HasForeignKey(readState => readState.ConversationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PrivateChatReadState>()
                .HasOne(readState => readState.User)
                .WithMany(user => user.PrivateChatReadStates)
                .HasForeignKey(readState => readState.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PrivateChatReadState>()
                .HasIndex(readState => new { readState.ConversationId, readState.UserId })
                .IsUnique();

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.ActorUser)
                .WithMany()
                .HasForeignKey(n => n.ActorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.Group)
                .WithMany()
                .HasForeignKey(n => n.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.Membership)
                .WithMany()
                .HasForeignKey(n => n.MembershipId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AppNotification>()
                .HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt });
        }
    }
}
