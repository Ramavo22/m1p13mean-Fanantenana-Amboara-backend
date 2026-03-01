const supabase = require('../../config/supabase');
const path = require('path');
const crypto = require('crypto');

class StorageService {

    constructor() {
        this.supabase = supabase;
        this.productBucket = process.env.SUPABASE_PRODUCT_BUCKET;
        this.shopBucket = process.env.SUPABASE_SHOP_BUCKET;
    }

    /**
     * Upload une image vers Supabase Storage
     * @param {Object} file - Fichier à uploader
     * @param {string} bucket - Nom du bucket Supabase cible
     */
    async uploadImage(file, bucket) {
        if (!file) throw new Error('Aucun fichier fourni');
        if (!bucket) throw new Error('Le bucket de destination est requis');
        if (!this.validateImageFile(file)) throw new Error('Type de fichier non autorisé');

        console.log('en env,'+ this.productBucket+"\n\n\n");
        console.log('en env,'+ this.shopBucket+"\n\n\n");
        console.log('en fonction '+bucket);

        const fileExtension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `photo_${Date.now()}_${crypto.randomUUID()}${fileExtension}`;

        const { data, error } = await this.supabase
            .storage
            .from(bucket)
            .upload(uniqueName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw new Error(`Erreur upload Supabase: ${error.message}`);

        const { data: publicUrlData } = this.supabase
            .storage
            .from(bucket)
            .getPublicUrl(uniqueName);

        return {
            fileName: uniqueName,       // <- utilisé pour deletePhoto
            publicUrl: publicUrlData.publicUrl
        };
    }

    /**
     * Supprime une image du bucket Supabase
     * @param {string} fileName - nom du fichier à supprimer
     * @param {string} bucket - Nom du bucket Supabase cible
     */
    async deletePhoto(fileName, bucket) {
        if (!fileName) throw new Error('Aucun nom de fichier fourni pour suppression');
        if (!bucket) throw new Error('Le bucket de destination est requis');

        const { error } = await this.supabase
            .storage
            .from(bucket)
            .remove([fileName]);

        if (error) throw new Error(`Erreur suppression Supabase: ${error.message}`);

        console.log(`Photo supprimée avec succès: ${fileName}`);
        return true;
    }

    /**
     * Vérifie le type de fichier
     */
    validateImageFile(file) {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        return file && allowedMimeTypes.includes(file.mimetype);
    }
}

module.exports = new StorageService();