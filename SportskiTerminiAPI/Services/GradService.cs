using SportskiTerminiAPI.DTOs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Services
{
    public class GradService : IGradService
    {
        private readonly IGradRepository _gradRepository;

        public GradService(IGradRepository gradRepository)
        {
            _gradRepository = gradRepository;
        }

        public async Task<ServiceResult> AddGradAsync(GradDto gradDto)
        {
            if (gradDto == null || string.IsNullOrWhiteSpace(gradDto.Naziv) || string.IsNullOrWhiteSpace(gradDto.Kanton))
            {
                return ServiceResult.BadRequest("Naziv and Kanton are required fields.");
            }

            var noviGrad = new Grad
            {
                Naziv = gradDto.Naziv,
                Kanton = gradDto.Kanton
            };

            var dodaniGrad = await _gradRepository.AddGradAsync(noviGrad);
            return ServiceResult.Ok(dodaniGrad);
        }

        public async Task<IEnumerable<Grad>> GetAllGradoviAsync()
        {
            return await _gradRepository.GetAllGradoviAsync();
        }
    }
}
