using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Models;
using SportskiTerminiAPI.Services;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGradService
    {
        Task<ServiceResult> AddGradAsync(GradDto gradDto);
        Task<IEnumerable<Grad>> GetAllGradoviAsync();
    }
}
