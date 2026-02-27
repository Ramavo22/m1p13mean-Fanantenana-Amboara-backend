const supabase = require('../../config/supabase');

/**
 * Test de connexion Supabase - Liste tous les buckets
 */
const listBuckets = async (req, res) => {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des buckets',
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Connexion Supabase réussie',
      bucketsCount: data.length,
      buckets: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Créer un nouveau bucket
 */
const createBucket = async (req, res) => {
  try {
    const { bucketName, isPublic = true } = req.body;

    if (!bucketName) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du bucket est requis',
      });
    }

    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
    });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du bucket',
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Bucket '${bucketName}' créé avec succès`,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

/**
 * Lister les fichiers dans un bucket
 */
const listFilesInBucket = async (req, res) => {
  try {
    const { bucketName } = req.params;
    const { folder = '' } = req.query;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Erreur lors de la récupération des fichiers du bucket '${bucketName}'`,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Fichiers du bucket '${bucketName}' récupérés`,
      filesCount: data.length,
      files: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

module.exports = {
  listBuckets,
  createBucket,
  listFilesInBucket,
};
