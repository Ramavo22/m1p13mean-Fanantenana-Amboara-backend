// Data Transfer Object pour la validation et la transformation des données utilisateur

class UserDTO {
  // Créer un DTO pour la création d'utilisateur
  static createUserDTO(data) {
    return {
      role: data.role || 'ACHETEUR',
      login: data.login?.trim(),
      password: data.password,
      profile: {
        fullName: data.profile?.fullName?.trim(),
        tel: data.profile?.tel,
        solde: data.profile?.solde || 0,
        email: data.profile?.email?.toLowerCase().trim(),
        address: data.profile?.address?.trim(),
      },
      status: data.status || 'ACTIVE',
    };
  }

  // Créer un DTO pour la mise à jour d'utilisateur
  static updateUserDTO(data) {
    const dto = {};

    if (data.role !== undefined) dto.role = data.role;
    if (data.login !== undefined) dto.login = data.login?.trim();
    if (data.password !== undefined) dto.password = data.password;
    if (data.status !== undefined) dto.status = data.status;

    if (data.profile) {
      dto.profile = {};
      if (data.profile.fullName !== undefined) {
        dto.profile.fullName = data.profile.fullName?.trim();
      }
      if (data.profile.tel !== undefined) {
        dto.profile.tel = data.profile.tel;
      }
      if (data.profile.solde !== undefined) {
        dto.profile.solde = data.profile.solde;
      }
      if (data.profile.email !== undefined) {
        dto.profile.email = data.profile.email?.toLowerCase().trim();
      }
      if (data.profile.address !== undefined) {
        dto.profile.address = data.profile.address?.trim();
      }
    }

    return dto;
  }

  // Formater la réponse utilisateur (sans données sensibles)
  static formatUserResponse(user) {
    if (!user) return null;

    return {
      _id: user._id,
      role: user.role,
      login: user.login,
      profile: user.profile,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Valider les données de création d'utilisateur
  static validateCreateUser(data) {
    const errors = [];

    if (!data.login || data.login.trim().length < 3) {
      errors.push('Le login doit contenir au moins 3 caractères');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!data.profile?.fullName || data.profile.fullName.trim().length === 0) {
      errors.push('Le nom complet est requis');
    }

    if (!data.profile?.tel || !/^[0-9]{10}$/.test(data.profile.tel)) {
      errors.push('Le téléphone doit contenir 10 chiffres');
    }

    if (data.role && !['ADMIN', 'BOUTIQUE', 'ACHETEUR'].includes(data.role)) {
      errors.push('Le rôle doit être ADMIN, BOUTIQUE ou ACHETEUR');
    }

    if (data.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(data.status)) {
      errors.push('Le statut doit être ACTIVE, INACTIVE ou SUSPENDED');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Valider les données de mise à jour d'utilisateur
  static validateUpdateUser(data) {
    const errors = [];

    if (data.login !== undefined && data.login.trim().length < 3) {
      errors.push('Le login doit contenir au moins 3 caractères');
    }

    if (data.password !== undefined && data.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (data.profile?.fullName !== undefined && data.profile.fullName.trim().length === 0) {
      errors.push('Le nom complet ne peut pas être vide');
    }

    if (data.profile?.tel !== undefined && !/^[0-9]{10}$/.test(data.profile.tel)) {
      errors.push('Le téléphone doit contenir 10 chiffres');
    }

    if (data.role !== undefined && !['ADMIN', 'BOUTIQUE', 'ACHETEUR'].includes(data.role)) {
      errors.push('Le rôle doit être ADMIN, BOUTIQUE ou ACHETEUR');
    }

    if (data.status !== undefined && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(data.status)) {
      errors.push('Le statut doit être ACTIVE, INACTIVE ou SUSPENDED');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = UserDTO;
