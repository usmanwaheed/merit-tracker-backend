// src/supabase/supabase.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration');
        }

        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    async uploadFile(
        file: Buffer,
        fileName: string,
        mimeType: string,
        userId: string,
    ): Promise<string> {
        try {
            const fileExtension = this.getFileExtension(mimeType);
            if (!fileExtension) {
                throw new BadRequestException(
                    `File type ${mimeType} is not supported.`,
                );
            }
            const baseFileName = fileName.replace(/\.[^/.]+$/, '');
            const uniqueFileName = `${userId}/${crypto.randomUUID()}-${baseFileName}${fileExtension}`;

            const { data, error } = await this.supabase.storage
                .from('JoltBucket')
                .upload(uniqueFileName, file, {
                    contentType: mimeType,
                    upsert: false,
                });

            if (error) {
                throw new BadRequestException(`Failed to upload file: ${error.message}`);
            }

            const { data: urlData } = this.supabase.storage
                .from('JoltBucket')
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to upload file to storage');
        }
    }

    async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
        try {
            let path = filePath;

            if (filePath.includes('/storage/v1/object/public/JoltBucket/')) {
                path = filePath.split('/storage/v1/object/public/JoltBucket/')[1];
            } else if (filePath.includes('/JoltBucket/')) {
                path = filePath.split('/JoltBucket/')[1];
            }

            path = decodeURIComponent(path);

            const { error } = await this.supabase.storage
                .from('JoltBucket')
                .remove([path]);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    private getFileExtension(mimeType: string): string {
        const extensions: { [key: string]: string } = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'video/mp4': '.mp4',
            'video/mpeg': '.mpeg',
            'video/quicktime': '.mov',
            'video/avi': '.avi',
            'video/webm': '.webm',
            'application/pdf': '.pdf',
        };

        return extensions[mimeType] || '';
    }
}