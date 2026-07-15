using Microsoft.AspNetCore.Http;
using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.DTOs.Admin;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IArenaService
    {
        Task<IEnumerable<ArenaDto>> GetArenasAsync(string? city, string? sportType, string? searchTerm);
        Task<IEnumerable<AdminArenaDto>> GetAllArenasForAdminAsync(string? name, string? city, string? sportType);
        Task<(IEnumerable<string> Cities, IEnumerable<string> Sports)> GetArenaFilterOptionsAsync();
        Task<ArenaDto?> GetArenaByIdAsync(int id);
        Task<IEnumerable<TimeRangeDto>?> GetAvailabilityAsync(int arenaId, DateTime dateUtc);
        Task<ServiceResult> CreateArenaAsync(CreateArenaDto createArenaDto);
        Task<ServiceResult> UpdateArenaAsync(int id, UpdateArenaDto updateArenaDto);
        Task<ServiceResult> DeleteArenaAsync(int id);
        Task<ServiceResult> UploadArenaPictureAsync(int arenaId, IFormFile file, string scheme, HostString host);
    }
}
